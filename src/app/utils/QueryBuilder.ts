import mongoose, { Query } from "mongoose";
import { excludeField } from "../constants/constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;
  public readonly booleanFields: string[];

  constructor(
    modelQuery: Query<T[], T>,
    query: Record<string, string>,
    booleanFields: string[] = []
  ) {
    this.modelQuery = modelQuery;
    this.query = query;
    this.booleanFields = booleanFields;
  }

  filter(): this {
    // const filter = { ...this.query };
    const filter: Record<string, string | boolean> = { ...this.query };

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    for (const field of this.booleanFields) {
      if (field in filter) {
        if (filter[field] === "true") filter[field] = true;
        else if (filter[field] === "false") filter[field] = false;
      }
    }

    this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)

    return this;
  }

  // search(searchableField: string[]): this {
  //   const searchTerm = this.query.searchTerm || "";
  //   const searchQuery = {
  //     $or: searchableField.map((field) => ({
  //       [field]: { $regex: searchTerm, $options: "i" },
  //     })),
  //   };
  //   this.modelQuery = this.modelQuery.find(searchQuery);
  //   return this;
  // }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm?.trim();
    if (!searchTerm) return this;

    const orConditions: Record<string, unknown>[] = [];

    for (const field of searchableFields) {
      if (this.booleanFields.includes(field)) continue;
      if (field === "amount") {
        const num = Number(searchTerm);
        if (!isNaN(num)) {
          orConditions.push({ [field]: num });
        }
      } else if (field === "_id" || field.endsWith("._id")) {
        if (mongoose.Types.ObjectId.isValid(searchTerm)) {
          orConditions.push({
            [field]: new mongoose.Types.ObjectId(searchTerm),
          });
        }
      } else {
        orConditions.push({
          [field]: { $regex: searchTerm, $options: "i" },
        });
      }
    }

    if (orConditions.length > 0) {
      this.modelQuery = this.modelQuery.find({ $or: orConditions });
    }

    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const filter = this.modelQuery.getFilter();
    const totalDocuments = await this.modelQuery.model.countDocuments(filter);
    // const totalDocuments = await this.modelQuery.model.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}

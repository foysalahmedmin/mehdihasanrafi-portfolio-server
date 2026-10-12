"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppQuery {
    query;
    query_params;
    query_filter;
    page = 1;
    limit = 0;
    constructor(query, query_params) {
        this.query = query;
        this.query_params = query_params;
        this.query_filter = {};
    }
    search(applicableFields) {
        const searchValue = this.query_params.search;
        if (searchValue) {
            const searchConditions = {
                $or: applicableFields.map((field) => ({
                    [field]: { $regex: searchValue, $options: 'i' },
                })),
            };
            this.query_filter = { ...this.query_filter, ...searchConditions };
            this.query = this.query.find(searchConditions);
        }
        return this;
    }
    filter(applicableFields) {
        const queryObj = { ...this.query_params };
        const excludedFields = [
            'search',
            'sort',
            'limit',
            'page',
            'fields',
            'is_count_only',
        ];
        excludedFields.forEach((field) => delete queryObj[field]);
        // Normal filter
        if (applicableFields?.length) {
            Object.keys(queryObj).forEach((key) => {
                if (!applicableFields.includes(key)) {
                    delete queryObj[key];
                }
            });
        }
        const mongoFilter = {};
        // Handle OR
        if (queryObj.or) {
            try {
                mongoFilter.$or = Object.values(queryObj.or).map((cond) => cond);
            }
            catch (e) {
                console.error('Invalid OR format:', e);
            }
            delete queryObj.or;
        }
        // Handle AND
        if (queryObj.and) {
            try {
                mongoFilter.$and = Object.values(queryObj.and).map((cond) => cond);
            }
            catch (e) {
                console.error('Invalid AND format:', e);
            }
            delete queryObj.and;
        }
        // Merge remaining normal filters
        Object.assign(mongoFilter, queryObj);
        // Apply to query
        this.query_filter = { ...this.query_filter, ...mongoFilter };
        this.query = this.query.find(mongoFilter);
        return this;
    }
    sort(applicableFields) {
        const rawSort = this.query_params.sort ?? '';
        let fields = rawSort.split(',').filter(Boolean);
        if (applicableFields?.length) {
            fields = fields.filter((field) => {
                const fieldName = field.startsWith('-') ? field.slice(1) : field;
                return applicableFields.includes(fieldName);
            });
        }
        const sortOrder = fields.length > 0 ? fields.join(' ') : '-createdAt';
        this.query = this.query.sort(sortOrder);
        return this;
    }
    paginate() {
        const { page, limit } = this.query_params;
        if (limit && page) {
            this.page = Number(page) || 1;
            this.limit = Number(limit) || 10;
            const skip = (this.page - 1) * this.limit;
            this.query = this.query.skip(skip).limit(this.limit);
        }
        return this;
    }
    fields(applicableFields) {
        const rawFields = this.query_params.fields ?? '';
        let selectedFields = rawFields.split(',').filter(Boolean);
        if (applicableFields?.length) {
            selectedFields = selectedFields.filter((field) => {
                const fieldName = field.startsWith('-') ? field.slice(1) : field;
                return applicableFields.includes(fieldName);
            });
        }
        const fieldSelection = selectedFields.length > 0
            ? selectedFields.join(' ')
            : (applicableFields?.join(' ') ?? '-__v');
        this.query = this.query.select(fieldSelection);
        return this;
    }
    tap(callback) {
        this.query = callback(this.query);
        return this;
    }
    async execute(statisticsQueries) {
        const [total, stats] = await Promise.all([
            this.query.model.countDocuments({
                ...this.query_filter,
                ...(!this.query_filter?.is_deleted && {
                    is_deleted: { $ne: true },
                }),
            }),
            statisticsQueries
                ? Promise.all(statisticsQueries.map(async (stat) => {
                    const count = await this.query.model.countDocuments({
                        ...this.query_filter,
                        ...stat.filter,
                        ...(!this.query_filter?.is_deleted && {
                            is_deleted: { $ne: true },
                        }),
                    });
                    return { key: stat.key, count };
                }))
                : Promise.resolve([]),
        ]);
        const statistics = stats?.reduce((acc, curr) => {
            acc[curr.key] = curr.count;
            return acc;
        }, {}) || undefined;
        if (Boolean(this.query_params.is_count_only)) {
            return {
                data: [],
                meta: {
                    total,
                    page: this.page,
                    limit: this.limit,
                    statistics,
                },
            };
        }
        const data = (await this.query);
        return {
            data,
            meta: { total, page: this.page, limit: this.limit, statistics },
        };
    }
}
exports.default = AppQuery;

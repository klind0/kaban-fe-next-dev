"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complexityPlugin = void 0;
const graphql_1 = require("graphql");
const graphql_query_complexity_1 = require("graphql-query-complexity");
const common_1 = require("@nestjs/common");
const MAX_COMPLEXITY = 80;
exports.complexityPlugin = {
    async requestDidStart({ schema }) {
        const logger = new common_1.Logger('ComplexityPlugin');
        return {
            async didResolveOperation({ request, document }) {
                if (request.operationName === 'IntrospectionQuery' ||
                    request.query?.includes('__schema')) {
                    return;
                }
                const complexity = (0, graphql_query_complexity_1.getComplexity)({
                    schema: schema,
                    operationName: request.operationName,
                    query: document,
                    variables: request.variables,
                    estimators: [
                        (0, graphql_query_complexity_1.fieldExtensionsEstimator)(),
                        (0, graphql_query_complexity_1.simpleEstimator)({ defaultComplexity: 1 }),
                    ],
                });
                if (complexity > MAX_COMPLEXITY) {
                    throw new graphql_1.GraphQLError(`Query too complex. Complexity: ${complexity}, max allowed: ${MAX_COMPLEXITY}`, {
                        extensions: {
                            code: 'QUERY_TOO_COMPLEX',
                            complexity,
                            maxComplexity: MAX_COMPLEXITY,
                        },
                    });
                }
                logger.debug(`Query complexity: ${complexity}/${MAX_COMPLEXITY}`);
            },
        };
    },
};
//# sourceMappingURL=complexity.plugin.js.map
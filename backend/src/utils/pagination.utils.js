// Utilidad para paginación
const paginationUtils = {
    // Obtener opciones de paginación
    getPaginationOptions: (page, limit, defaultLimit = 10) => {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || defaultLimit;
        const skip = (pageNum - 1) * limitNum;

        return {
            page: pageNum,
            limit: limitNum,
            skip
        };
    },

    // Formatear respuesta de paginación
    formatPaginationResponse: (data, total, page, limit) => {
        return {
            data,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    },

    // Crear enlaces para navegación
    createPaginationLinks: (baseUrl, page, totalPages, queryParams = {}) => {
        const links = {};
        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        if (page < totalPages) {
            links.next = `${baseUrl}?page=${page + 1}&limit=${queryParams.limit || 10}${queryString ? '&' + queryString : ''}`;
        }
        if (page > 1) {
            links.prev = `${baseUrl}?page=${page - 1}&limit=${queryParams.limit || 10}${queryString ? '&' + queryString : ''}`;
        }
        links.first = `${baseUrl}?page=1&limit=${queryParams.limit || 10}${queryString ? '&' + queryString : ''}`;
        links.last = `${baseUrl}?page=${totalPages}&limit=${queryParams.limit || 10}${queryString ? '&' + queryString : ''}`;

        return links;
    }
};

module.exports = paginationUtils;
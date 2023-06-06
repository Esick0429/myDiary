const http = uni.$u.http

export const getDiary = (params, config = {}) => http.get('http://119.91.27.40:4001/api/getDiary', params, config)

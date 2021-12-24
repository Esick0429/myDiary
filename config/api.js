const http = uni.$u.http

export const getDiary = (params, config = {}) => http.get('http://127.0.0.1:4001/api/getDiary', params, config)

// API响应结构
export interface ApiResponse<T> {
    status: number;       // 状态码
    code: number;         // 业务码
    msg: string;          // 响应消息
    data: T;              // 数据内容
}
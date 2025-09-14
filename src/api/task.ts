// 任务列表接口响应类型
export interface TaskResponse {
  code: number;
  data: {
    items: Task[];
    total: number;
  };
  message: string;
}

// 任务类型定义
export interface Task {
  award: string;
  description: string;
  expire_at: string;
  external_link: string;
  finished: boolean;
  id: number;
  publish_at: string;
  title: string;
}

// 用户积分接口响应类型
export interface TaskPointResponse {
  code: number;
  data: string;
  message: string;
}

// 开始任务接口响应类型
export interface StartTaskResponse {
  code: number;
  data: string;
  message: string;
}

/**
 * 获取任务列表
 * @param token - 用户认证令牌
 * @param params - 获取任务列表的参数，包括分页信息
 * @param params.page - 请求的页码
 * @param params.pageSize - 每页任务数量
 * @param mock - 是否使用模拟数据（可选，默认为 false）
 * @returns 返回任务列表响应，包含任务数据和总数
 * @remarks 支持 mock 模式，用于开发时模拟数据；实际请求调用 /tasks 接口，需要有效的 token
 */
export const fetchTasks = async (
  token: string,
  params: { page: number; pageSize: number },
  mock: boolean = true
): Promise<TaskResponse> => {
  if (mock) {
    // 创建任务数组，优化重复任务并增加多样性
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Trade Token',
        description: 'Complete your first token trade on the platform',
        award: '50 POINTS',
        finished: false,
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        publish_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        external_link: '/'
      },
      {
        id: 2,
        title: 'Create Token',
        description: 'Create your first token to participate in the airdrop',
        award: '50 POINTS',
        finished: false,
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        publish_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        external_link: '', 
      },
      {
        id: 3,
        title: 'Refer Friends',
        description: 'Invite friends to join the platform',
        award: '50 POINTS',
        finished: false,
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        publish_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        external_link: '/referral',
      },
      {
        id: 4,
        title: 'Complete Profile',
        description: 'Fill out your profile information',
        award: '50 POINTS',
        finished: false,
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        publish_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        external_link: '/assets',
      },
    ];

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 应用分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedTasks = mockTasks.slice(startIndex, endIndex);

    return {
      code: 200,
      data: {
        items: paginatedTasks,
        total: mockTasks.length,
      },
      message: 'success',
    };
  } else {
    const queryString = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    }).toString();

    const response = await fetch(`/tasks?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

/**
 * 获取用户任务积分
 * @param token - 用户认证令牌
 * @param mock - 是否使用模拟数据（可选，默认为 false）
 * @returns 返回用户任务积分响应，包含积分数据
 * @remarks 调用 /user/task/point 接口，需要有效的 token；在 mock 模式下返回模拟积分
 */
export const fetchUserTaskPoints = async (
  token: string,
  mock: boolean = true
): Promise<TaskPointResponse> => {
  if (mock) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟用户积分数据
    console.log('使用 mock 用户任务积分数据');
    return {
      code: 200,
      data: '150', // 假设用户有 150 积分
      message: 'success',
    };
  } else {
    const response = await fetch(`/user/task/point`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

/**
 * 开始任务
 * @param token - 用户认证令牌
 * @param taskId - 任务 ID
 * @param mock - 是否使用模拟数据（可选，默认为 false）
 * @returns 返回开始任务响应，包含操作结果
 * @remarks 调用 /task/start/{taskId} 接口，需要有效的 token；在 mock 模式下模拟任务开始
 */
export const startTask = async (
  token: string,
  taskId: number,
  mock: boolean = true
): Promise<StartTaskResponse> => {
  if (mock) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 600));

    // 模拟开始任务结果
    console.log(`使用 mock 开始任务数据，taskId: ${taskId}`);
    if (taskId <= 0) {
      return {
        code: 400,
        data: '',
        message: '无效的任务 ID',
      };
    }
    return {
      code: 200,
      data: `task_${taskId}_started`,
      message: '任务开始成功',
    };
  } else {
    const response = await fetch(`/task/start/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};
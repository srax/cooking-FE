/**
 * 上传图片到 IPFS
 * @param file - 要上传的文件
 * @returns 返回上传成功后的图片 URL
 * @remarks 调用 /api/ipfs/upload 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录、文件无效或服务器错误，会抛出错误
 */
export const uploadImageToIPFS = async (file: File): Promise<string> => {
  try {
    // 检查是否登录
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('Please log in and upload the image first');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/ipfs/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // 添加认证头
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('upload image error');
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data;
    }

    throw new Error(data.message || 'upload image error');
  } catch (error) {
    console.error('upload image error:', error);
    throw error;
  }
};
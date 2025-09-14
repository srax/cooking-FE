'use client';

import React, { useState } from 'react';
import UploadImage from './UploadImage';
// import Demo from './Demo'

// json 文件
// https://golden-shovel.quicknode-ipfs.com/ipfs/QmX6XUZvANXKazArsPsvTGh6SMcyokKdaKefMdKTrNYUtP

// 格式
// {
//   "name": "NEW SYMMETRICAL CAT",
//   "symbol": "HATEE",
//   "description": "",
//   "image": "https://ipfs.io/ipfs/QmNcvzvqc5VpG2MfJzuHMPphDT29zkUQJCHom1kbUAYTWe",
//   "showName": true, ？
//   "createdOn": "https://cooking.city",
//   "website": "https://www.tiktok.com/@hatee029/video/7471637144952507655?q=cat%20symmetry&t=1740089069885"
//   "twitter"
//   "telegram"
//   "discord"
// }

// mitt： 5uQYBV8wB7EfcBF4kUdToCtTCcnQHZhCDSHpKJZNcook

const FormComponent = () => {
  const [formData, setFormData] = useState({
    "name": "LYNN",
    "symbol": "TEST",
    "description": "my test",
    "image": "https://ipfs.io/ipfs/QmNcvzvqc5VpG2MfJzuHMPphDT29zkUQJCHom1kbUAYTWe",
    "createdOn": "https://cooking.city",
    "website": "https://www.tiktok.com/@hatee029/video/7471637144952507655?q=cat%20symmetry&t=1740089069885",
    "twitter": "https://www.tiktok.com/@hatee029/video/7471637144952507655?q=cat%20symmetry&t=1740089069885",
    "telegram": "https://www.tiktok.com/@hatee029/video/7471637144952507655?q=cat%20symmetry&t=1740089069885",
    "discord": "https://www.tiktok.com/@hatee029/video/7471637144952507655?q=cat%20symmetry&t=1740089069885",
    "buy": 0.1
  });
  const [uploadResponse, setUploadResponse] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 将表单数据转换为 JSON
    const jsonBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
    const formDataToUpload = new FormData();
    formDataToUpload.append('file', jsonBlob, 'formData.json'); // 将 JSON 文件添加到 FormData

    try {
      const response = await fetch('https://api.cooking.city/ipfs/upload', {
        method: 'POST',
        body: formDataToUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadResponse(data.message); 
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResponse('Upload failed');
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            名称:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            标志:
            <input type="text" name="symbol" value={formData.symbol} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            描述:
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            图片链接:
            <input type="text" name="image" value={formData.image} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            创建时间:
            <input type="text" name="createdOn" value={formData.createdOn} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            网站:
            <input type="text" name="website" value={formData.website} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            Twitter:
            <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Telegram:
            <input type="text" name="telegram" value={formData.telegram} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Discord:
            <input type="text" name="discord" value={formData.discord} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            购买价格:
            <input type="number" name="buy" value={formData.buy} onChange={handleChange} required />
          </label>
        </div>
        <button type="submit">提交</button>
      </form>
      {uploadResponse && <p>{uploadResponse}</p>}
      <UploadImage />
      {/* <Demo /> */}
    </div>
  );
};

export default FormComponent; 
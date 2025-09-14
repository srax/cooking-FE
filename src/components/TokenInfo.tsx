'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardBody,
    Avatar,
    Tooltip,
    Spinner
} from '@heroui/react'
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane, FaDiscord } from "react-icons/fa";
import { getTokenDetail, TokenDetailResponse } from '@/api/token';
import { AiOutlineGlobal } from "react-icons/ai";
import { Link } from '@/i18n/navigation'
import { formatQuantity, formatTimeAgo, shortenAddress } from '@/utils';

export default function TokenInfo({ address }: { address: string }) {
    const [tokenData, setTokenData] = useState<TokenDetailResponse['data'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTokenDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getTokenDetail(address);
                if (response.code === 200 && response.data) {
                    setTokenData(response.data);
                } else if (response.code === 404) {
                    setError('Token not found');
                } else {
                    setError(response.error || 'Failed to fetch token details');
                }
            } catch (error) {
                console.error('Failed to fetch token detail:', error);
                setError('Failed to fetch token details');
            } finally {
                setLoading(false);
            }
        };

        fetchTokenDetail();
    }, [address]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,372px] gap-3">
            {/* 左侧区域 */}
            <Card className="bg-[#332231] border-2 border-black rounded-lg">
                <CardBody className="p-4">
                    {loading ? (
                        <Spinner />
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="flex items-start gap-6">
                            {/* 头像区域 */}
                            <div className="flex-shrink-0">
                                <Avatar
                                    src={tokenData?.logo}
                                    className="w-24 h-24"
                                    fallback="D"
                                />
                            </div>
                            {/* 内容区域 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 justify-between mb-3">
                                    <h1 className="text-xl font-medium text-white">
                                        {tokenData?.name || "No Token"}
                                    </h1>
                                    <div className="flex gap-2">
                                        {tokenData?.twitter && (
                                            <Tooltip  content="X/Twitter">
                                                <Link href={tokenData.twitter} className='bg-white/10 w-5 h-5 p-1 rounded-full'  target="_blank">
                                                    <FaXTwitter className='size-3 text-gray-400' />
                                                </Link>
                                            </Tooltip>
                                        )}
                                        {tokenData?.telegram && (
                                            <Tooltip content="Telegram">
                                                <Link className='bg-white/10 w-5 h-5 p-1 rounded-full' href={tokenData.telegram} target="_blank">
                                                    <FaTelegramPlane className='size-3 text-gray-400' />
                                                </Link>
                                            </Tooltip>
                                        )}
                                        {tokenData?.discord && (
                                            <Tooltip content="Discord">
                                                <Link className='bg-white/10 w-5 h-5 p-1 rounded-full' href={tokenData.discord} target="_blank">
                                                    <FaDiscord className='size-3 text-gray-400' />
                                                </Link>
                                            </Tooltip>
                                        )}
                                        {tokenData?.website && (
                                            <Tooltip content="Website">
                                                <Link href={tokenData.website} target="_blank">
                                                    <AiOutlineGlobal className='size-4 text-gray-400' />
                                                </Link>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {tokenData?.description || "No Data"}
                                </p>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* 右侧区域 */}
            <Card className="bg-[#332231] border-2 border-black rounded-lg">
                <CardBody className="p-4">
                    {loading ? (
                        <Spinner />
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4">
                                <p className="text-gray-400 text-xs uppercase mb-1">created at </p>
                                <p className="text-white text-base">
                                    {formatTimeAgo(tokenData?.created_at||'', 'en') || "No Data"}
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-400 text-xs uppercase mb-1">market cap</p>
                                <p className="text-white text-base">
                                   ${formatQuantity(tokenData?.market_cap || '0')|| "No Data"}
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-400 text-xs uppercase mb-1">CA</p>
                                <a target='_blank' href={`https://solscan.io/account/${tokenData?.address}?cluster=m${process.env.NEXT_PUBLIC_IS_DEV==='false'?  "mainnet":'devnet'}`}>
                                    <p className="text-white text-base">
                                        {shortenAddress(tokenData?.address || '') || "No Data"}
                                    </p>
                                </a>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-400 text-xs uppercase mb-1">Created by</p>
                                <a target='_blank' href={`https://solscan.io/account/${tokenData?.signer}?cluster=${process.env.NEXT_PUBLIC_IS_DEV==='false'?  "mainnet":'devnet'}`}>
                                    <p className="text-white text-base">
                                        {shortenAddress(tokenData?.signer || '') || "No Data"}
                                    </p>
                                </a>

                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Divider,
  addToast,
} from '@heroui/react';
import { fetchTasks, startTask, Task as TaskType } from '@/api/task';
import Image from 'next/image';
import { IoCaretDownSharp } from 'react-icons/io5';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CreateTokenModal from '@/components/CreateTokenModal';

export default function Task() {
  const t = useTranslations('Task');
  const tAirdrop = useTranslations('Airdrop'); // 引入 Airdrop 翻译
  const { getUserPoints } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [userPoints, setUserPoints] = useState<string>(getUserPoints());
  const [currentTaskId, setCurrentTaskId] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  const page = useRef(1);

  // 获取任务列表
  const getTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast({
        title: t('toasts.getFailed.title'),
        description: t('toasts.getFailed.loginFirst'),
        color: 'danger',
      });
      return;
    }
    try {
      setLoading(true);
      const response = await fetchTasks(token, { page: 1, pageSize: 10 }, true);
      if (response.code === 200) {
        setTasks(response.data.items);
        setHasMore(response.data?.total > (response.data?.items?.length || 0));
        page.current = 1;
      }
    } catch (error) {
      addToast({
        title: t('toasts.getFailed.title'),
        description: t('toasts.getFailed.getTaskListFailed'),
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };


  // 开始任务并处理跳转或弹窗
  // const handleStartTask = async (task: TaskType) => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     addToast({
  //       title: t('toasts.startTaskFailed.title'),
  //       description: t('toasts.startTaskFailed.pleaseLoginFirst'),
  //       color: 'danger',
  //     });
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setCurrentTaskId(task.id);
  //     const response = await startTask(token, task.id);
  //     if (response.code === 200) {
  //       await getTasks();
  //       setUserPoints(getUserPoints());
  //       addToast({
  //         title: t('toasts.taskStarted.title'),
  //         description: t('toasts.taskStarted.description'),
  //         color: 'success',
  //       });

  //       // 处理跳转或弹窗
  //       if (task.title === tAirdrop('tasks.createToken.title')) {
  //         setIsCreateTokenModalOpen(true);
  //       } else if (task.external_link) {
  //         router.push(task.external_link);
  //       }
  //     } else {
  //       addToast({
  //         title: t('toasts.startTaskFailed.title'),
  //         description: response.message,
  //         color: 'danger',
  //       });
  //     }
  //   } catch (error) {
  //     addToast({
  //       title: t('toasts.startTaskFailed.title'),
  //       description: t('toasts.startTaskFailed.tryAgainLater'),
  //       color: 'danger',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleDrup = (task:TaskType)=>{
    router.push('/'+locale+task.external_link)
  }

  // 加载更多任务
  const loadMoreTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetchTasks(token, { page: page.current + 1, pageSize: 10 }, true);
      if (response.code === 200) {
        setTasks((prev) => [...prev, ...response.data.items]);
        setHasMore(response.data.total > (page.current + 1) * 10);
        page.current += 1;
      }
    } catch (error) {
      addToast({
        title: t('toasts.getFailed.title'),
        description: t('toasts.startTaskFailed.tryAgainLater'),
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <>
      <Popover
        placement="bottom"
        showArrow={false}
        offset={20}
        classNames={{
          content: 'w-[370px] md:w-[440px] rounded-lg p-0 border-2 border-black bg-[#332231]',
        }}
        aria-label={t('accessibility.popover')}
      >
        <PopoverTrigger>
          <Button
            className="px-0 gap-1"
            isLoading={loading}
            startContent={
              <Image
                src="/images/task/icon.png"
                width={13}
                height={13}
                alt={t('images.taskIcon')}
              />
            }
            endContent={<IoCaretDownSharp />}
            aria-label={t('accessibility.triggerButton', { points: userPoints })}
          >
            {userPoints}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-full bg-[#41303F] h-[50px] flex items-center justify-between px-6 rounded-t-lg text-base">
            <div>{t('myPoints')}:</div>
            <div className="flex items-center gap-1 text-[#FCD845]">
              <Image
                src="/images/task/icon.png"
                width={17}
                height={17}
                alt={t('images.taskIcon')}
              />
              <span>{userPoints}</span>
            </div>
          </div>
          <div className="w-full px-5 max-h-[370px] overflow-y-auto">
            {tasks?.length ? (
              <>
                {tasks?.map((task, index) => (
                  <div
                    key={task.id}
                    className="py-3"
                    aria-label={t('accessibility.taskItem', { title: task.title })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="text-small font-bold">{task.title}</div>
                        <div className="text-tiny text-gray-400">{task.description}</div>
                      </div>
                      <div>
                        {task.title === tAirdrop('tasks.createToken.title') ? (
                          <CreateTokenModal
                            isOpen={isCreateTokenModalOpen}
                            onOpenChange={() => setIsCreateTokenModalOpen(!isCreateTokenModalOpen)}
                            className="border-[#5D485A] h-8 sm:h-9 text-xs sm:text-sm min-w-[80px]"
                          />
                        ) : (
                          <Button
                            className="border-[#5D485A]"
                            radius="sm"
                            size="sm"
                            variant="bordered"
                            isLoading={loading && task.id === currentTaskId}
                            onPress={()=>handleDrup(task)}
                            isDisabled={task.finished}
                            aria-label={t('accessibility.taskButton', {
                              action: task.finished ? t('done') : t('go'),
                              title: task.title,
                            })}
                          >
                            {task.finished ? t('done') : t('go')}
                          </Button>
                        )}
                      </div>
                    </div>
                    {tasks?.length - 1 !== index && <Divider className="mt-6" />}
                  </div>
                ))}

                <div className="py-4 text-center">
                  {hasMore ? (
                    <Button
                      className="text-[#ffd84c]"
                      size="sm"
                      variant="light"
                      onPress={loadMoreTasks}
                      isLoading={loading}
                      aria-label={t('accessibility.loadMoreButton')}
                    >
                      {t('loadMore')}
                    </Button>
                  ) : (
                    <div className="text-gray-400 text-sm">{t('noMore')}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="min-h-[120px] text-base flex items-center justify-center text-gray-400">
                {t('noTasks')}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
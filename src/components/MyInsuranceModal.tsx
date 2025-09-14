'use client';

import { Modal, ModalContent, ModalBody, Button, Accordion, AccordionItem } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { IoChatbubbles } from 'react-icons/io5';
import { useDisclosure } from '@heroui/react';

export default function MyInsuranceModal() {
  const t = useTranslations('MyInsuranceModal');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        className="h-[28px] px-3 bg-[#FCD845] text-black rounded text-sm whitespace-nowrap hover:bg-[#FCD845]/90"
        onPress={onOpen}
        aria-label={'openButton'}
      >
        {t('openButton')}
      </Button>
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: "bg-[#2E1C2C] bg-[url('/images/home/Rectangle.png')] bg-no-repeat bg-center bg-cover bg-fixed",
          body: "p-0 pt-[94px]",
          closeButton:
            "w-[40px] h-[40px] bg-white/20 flex items-center justify-center top-[12px] right-[12px]",
        }}
        size="full"
        scrollBehavior="inside"
        aria-label={t('accessibility.modal')}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody className="px-2.5">
              <div className="w-full max-w-7xl md:mx-auto space-y-2.5">
                <div className="md:h-[415px] border-2 border-black rounded-lg bg-[#332231] w-full p-5 md:p-9 md:flex md:gap-[64px]">
                  <div className="flex flex-col flex-1 gap-5">
                    <div className="font-[montserrat] text-[48px] md:text-[64px] leading-[50px] md:leading-[70px]">
                      {t('title')}
                    </div>
                    <div className="text-sm">{t('description', { days: 3 })}</div>
                  </div>
                  <div className="w-full h-full md:max-w-[450px] bg-[#402C3D] rounded-lg p-6 md:p-10 mt-6 md:mt-0">
                    {t('formPlaceholder')}
                  </div>
                </div>
                <div className="border-2 border-black rounded-lg bg-[#332231] w-full p-5 md:p-9">
                  <div
                    className="flex items-center justify-center gap-2 mb-10"
                    aria-label={t('accessibility.faqSection')}
                  >
                    <IoChatbubbles className="w-[30px] h-[30px]" />
                    <span className="text-xl md:text-2xl font-[montserrat]">
                      {t('faq.title')}
                    </span>
                  </div>
                  <Accordion
                    variant="splitted"
                    itemClasses={{
                      base: "py-0 w-full bg-[#402C3D] rounded-lg",
                      title: "text-base font-normal text-medium",
                      indicator:
                        "flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[#533D50]",
                      content: "text-sm text-[#B3A0B1]",
                    }}
                  >
                    <AccordionItem
                      key="1"
                      aria-label={t('accessibility.faqItem', {
                        title: t('faq.items.whatIsInsurance.title'),
                      })}
                      title={t('faq.items.whatIsInsurance.title')}
                    >
                      {t('faq.items.whatIsInsurance.content')}
                    </AccordionItem>
                    <AccordionItem
                      key="2"
                      aria-label={t('accessibility.faqItem', {
                        title: t('faq.items.howItWorks.title'),
                      })}
                      title={t('faq.items.howItWorks.title')}
                    >
                      {t('faq.items.howItWorks.content')}
                    </AccordionItem>
                    <AccordionItem
                      key="3"
                      aria-label={t('accessibility.faqItem', {
                        title: t('faq.items.howToRedeem.title'),
                      })}
                      title={t('faq.items.howToRedeem.title')}
                    >
                      {t('faq.items.howToRedeem.content')}
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
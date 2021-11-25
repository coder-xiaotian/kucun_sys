import { Steps } from 'antd';
import { useState, createContext } from 'react';
import UploadData from '@/component/upload-data';
import DataPreview from '@/component/data-preview';

export const Ctx = createContext(
  {} as {
    setLaihuoFile: (file: ArrayBuffer) => void;
    setFahuoFile: (file: ArrayBuffer) => void;
    setColorMap: (map: Record<string, string>) => void;
  },
);
export default function IndexPage() {
  console.log('test index');
  const [step, setStep] = useState(0);
  const [laihuoFile, setLaihuoFile] = useState<ArrayBuffer>();
  const [fahuoFile, setFahuoFile] = useState<ArrayBuffer>();
  const [colorMap, setColorMap] = useState<Record<string, string>>();
  function handleNextStep() {
    setStep(step + 1);
  }
  function handleReUpload() {
    setStep(0);
  }

  return (
    <Ctx.Provider value={{ setLaihuoFile, setFahuoFile, setColorMap }}>
      <div className="flex flex-col items-center">
        <Steps className="!w-[400px] !mt-4" current={step}>
          <Steps.Step title="上传表格"></Steps.Step>
          <Steps.Step title="结果预览"></Steps.Step>
        </Steps>
        {step === 0 ? (
          <UploadData nextStep={handleNextStep} />
        ) : (
          <DataPreview
            reupload={handleReUpload}
            colorMap={colorMap!}
            laihuoFile={laihuoFile!}
            fahuoFile={fahuoFile!}
          />
        )}
      </div>
    </Ctx.Provider>
  );
}

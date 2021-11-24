import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useContext, useState, useEffect } from 'react'
import { Button, Form, Input, Select, Space, Modal, message } from 'antd'
import { Ctx } from '@/pages'

const { ipcRenderer } = window.require('electron')

export default (props: { nextStep: () => void }) => {
  const [form] = Form.useForm()
  const { setFahuoFile, setLaihuoFile, setColorMap } = useContext(Ctx)
  function handleLaihuoClick() {
    ipcRenderer.send('read-laihuo-excel')
    ipcRenderer.on('read-laihuo-success', (evt: any, fileName: string, file: ArrayBuffer) => {
      form.setFields([{ name: 'laihuo', value: fileName }])
      setLaihuoFile(file)
    })
  }
  function handleFahuoClick() {
    ipcRenderer.send('read-fahuo-excel')
    ipcRenderer.on('read-fahuo-success', (evt: any, fileName: string, file: ArrayBuffer) => {
      form.setFields([{ name: 'fahuo', value: fileName }])
      setFahuoFile(file)
    })
  }
  async function handleNextStep() {
    await form.validateFields()
    const values = form.getFieldsValue()
    setColorMap(values.colorMaps.reduce((map: any, item: any) => ({ ...map, [item.cn]: item.en }), {}))
    props.nextStep()
  }

  const [saveVisible, setSaveVisible] = useState(false)
  const [saveForm] = Form.useForm()
  const [colorMapTpl, setColorMapTpl] = useState<Record<string, { cn: string, en: string }[]>>({})
  const [selectedTpl, setSelectedTpl] = useState<string>()
  useEffect(() => {
    const tpl = JSON.parse(localStorage.getItem('colorMapTpls') ?? '{}')
    setColorMapTpl(tpl)
  }, [])
  async function handleOpenSave() {
    const value = form.getFieldsValue()
    if (!value.colorMaps?.length) return
    const validatePaths = value.colorMaps.reduce((res: any, item: any, i: number) => [...res, ['colorMaps', i, 'cn'], ['colorMaps', i, 'en']], [])
    await form.validateFields(validatePaths)
    setSaveVisible(true)
    saveForm.resetFields()
  }
  async function handleConfirmSave() {
    await saveForm.validateFields()
    const value = saveForm.getFieldsValue()
    const colorMaps = form.getFieldsValue().colorMaps ?? []
    colorMapTpl[value.name] = colorMaps
    localStorage.setItem('colorMapTpls', JSON.stringify(colorMapTpl))

    message.success('保存模版成功!')
    setSaveVisible(false)
  }
  function handleCloseSave() {
    setSaveVisible(false)
  }
  function handleSelectTpl(value: string) {
    setSelectedTpl(value)
    form.setFields([{ name: 'colorMaps', value: colorMapTpl[value] }])
  }

  return (
    <Form form={form} className="!mt-4 w-4/6" labelCol={{ span: 5 }}>
      <Form.Item label="来货表" name="laihuo" rules={[{ required: true, message: '请上传来货表!' }]}>
        <Input onClick={handleLaihuoClick} placeholder="点击上传" />
      </Form.Item>
      <Form.Item label="发货表" name="fahuo" rules={[{ required: true, message: '请上传发货表!' }]}>
        <Input onClick={handleFahuoClick} placeholder="点击上传" />
      </Form.Item>
      <Form.Item label="颜色映射" required>
        <div className="inline-block w-[295px] h-[250px] p-2 rounded bg-gray-8 align-top overflow-auto">
          <Form.List name="colorMaps" rules={[{
            validator(rule, value) {
              if (!value || !value?.length) return Promise.reject()
              return Promise.resolve()
            }, message: '请填写颜色映射!'
          }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      className="!mb-0"
                      {...restField}
                      name={[name, 'cn']}
                      fieldKey={[fieldKey, 'first']}
                      rules={[{ required: true, message: '请写颜色中文名！' }]}
                    >
                      <Input className="!w-25" placeholder="中文名" />
                    </Form.Item>
                    <span className="inline-block w-10 h-0.5 bg-gray-5"></span>
                    <Form.Item
                      className="!mb-0"
                      {...restField}
                      name={[name, 'en']}
                      fieldKey={[fieldKey, 'last']}
                      rules={[{ required: true, message: '请写颜色英文名!' }]}
                    >
                      <Input className="!w-25" placeholder="英文名" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} className="!text-error" />
                  </Space>
                ))}
                <Form.Item className="!mb-0">
                  <div className="flex justify-between">
                    <Button className="!w-7/12" type="primary" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加
                    </Button>
                    <Button className="!w-4/12" onClick={handleOpenSave}>存为模版</Button>
                  </div>
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </div>
        <Select className="inline-block !w-[80px] !ml-4 align-top" placeholder="模版" value={selectedTpl} onChange={handleSelectTpl} showSearch>
          {
            Object.keys(colorMapTpl).map(key => <Select.Option value={key} key={key}>{key}</Select.Option>)
          }
        </Select>
      </Form.Item>
      <Form.Item className="!text-right">
        <Button type="primary" onClick={handleNextStep}>下一步</Button>
      </Form.Item>

      <Modal title="保存颜色映射模版"
        onOk={handleConfirmSave}
        visible={saveVisible}
        onCancel={handleCloseSave}
        okText="确认"
        cancelText="取消"
        >
        <Form form={saveForm}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称!' }]}>
            <Input placeholder='输入模版名称，可覆盖之前的'></Input>
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  )
}

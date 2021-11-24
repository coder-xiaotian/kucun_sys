import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useContext } from 'react'
import { Button, Form, Input, Select, Space } from 'antd'
import { Ctx } from '@/pages'

const { ipcRenderer } = window.require('electron')

export default (props: { nextStep: () => void }) => {
  const [form] = Form.useForm()
  const {setFahuoFile, setLaihuoFile, setColorMap} = useContext(Ctx)
  function handleLaihuoClick() {
    ipcRenderer.send('read-laihuo-excel')
    ipcRenderer.on('read-laihuo-success', (evt: any, fileName: string, file: ArrayBuffer) => {
      form.setFields([{name: 'laihuo', value: fileName}])
      setLaihuoFile(file)
    })
  }
  function handleFahuoClick() {
    ipcRenderer.send('read-fahuo-excel')
    ipcRenderer.on('read-fahuo-success', (evt: any, fileName: string, file: ArrayBuffer) => {
      form.setFields([{name: 'fahuo', value: fileName}])
      setFahuoFile(file)
    })
  }
  async function handleNextStep() {
    await form.validateFields()
    const values = form.getFieldsValue()
    setColorMap(values.colorMaps.reduce((map: any, item: any) => ({...map, [item.cn]: item.en}), {}))
    props.nextStep()
  }

  const defaultValue = {
    colorMaps: [{
      cn: '白底红花',
      en: 'White with red flowers'
    }, {
      cn: '红橙点',
      en: 'Red orange point'
    }, {
      cn: '酒红',
      en: 'wine red'
    }, {
      cn: '白色',
      en: 'white'
    }, {
      cn: '白底红花',
      en: 'White printing'
    }, {
      cn: '黑色波点',
      en: 'Black wave point'
    }, {
      cn: '黑色',
      en: 'black'
    }, {
      cn: '深蓝花',
      en: 'Deep blue flowers'
    }, {
      cn: '深绿',
      en: 'dark green'
    }]
  }
  return (
    <Form form={form} className="!mt-4 w-4/6" labelCol={{ span: 5 }} initialValues={defaultValue}>
      <Form.Item label="来货表" name="laihuo" rules={[{ required: true, message: '请上传来货表!' }]}>
        <Input onClick={handleLaihuoClick} placeholder="点击上传" />
      </Form.Item>
      <Form.Item label="发货表" name="fahuo" rules={[{ required: true, message: '请上传发货表!' }]}>
        <Input onClick={handleFahuoClick} placeholder="点击上传"/>
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
                    <Button className="!w-4/12">存为模版</Button>
                  </div>
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </div>
        <Select className="inline-block !w-[80px] !ml-4 align-top" placeholder="模版"></Select>
      </Form.Item>
      <Form.Item className="!text-right">
        <Button type="primary" onClick={handleNextStep}>下一步</Button>
      </Form.Item>
    </Form>
  )
}

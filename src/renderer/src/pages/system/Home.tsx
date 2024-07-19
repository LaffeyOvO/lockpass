import { PagePath } from '@common/entitys/page.entity'
import { Vault } from '@common/entitys/valuts.entity'
import { Icon_type, ModalType } from '@common/gloabl'
import Icon from '@renderer/components/icon'
import { useHistory } from '@renderer/libs/router'
import { AppStore, use_appstore } from '@renderer/models/app.model'
import { Button, Form, Input, message, Modal, Pagination, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useMemo, useState } from 'react'
const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 16 } }
export default function Home() {
  console.log('home render')
  const [form] = useForm()
  const history = useHistory()
  const [messageApi, contextHolder] = message.useMessage()
  const [show_edit, setShowEdit] = useState(false)
  const [show_del, setShowDel] = useState(false)
  const [edit_panel_title, setEditPanelTitle] = useState('')
  const [show_type, setShowType] = useState(ModalType.Add)
  const [page_size, setPageNum] = useState(10)
  const [cur_page, setCurPage] = useState(1)
  const [cur_info, setCurInfo] = useState<Vault>({} as Vault)
  const appstore = use_appstore() as AppStore
  useEffect(() => {
    getAllData()
  }, [])
  async function getAllData() {
    await appstore.FetchAllValuts()
  }
  const showitems = useMemo(() => {
    return appstore.vaults.slice((cur_page - 1) * page_size, cur_page * page_size)
  }, [appstore.vaults, cur_page, page_size])

  return (
    <div>
      {contextHolder}
      <div className=" bg-gray-100 p-8">
        <div className=" mx-auto">
          <h1 className="text-2xl font-semibold mb-4">密码库</h1>
          <Button
            className="mb-4"
            type="primary"
            onClick={() => {
              setEditPanelTitle('新增密码库')
              setShowType(ModalType.Add)
              form.resetFields()
              setShowDel(false)
              setShowEdit(true)
            }}
          >
            新增
          </Button>
          <div className="flex  flex-wrap items-center justify-start">
            {showitems.map((valut) => {
              return (
                <div
                  key={valut.id}
                  className="flex flex-col bg-white shadow-md rounded-lg p-4 w-64 border-t-4 h-[150px] border-purple-200 mr-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold">{valut.name}</h2>
                    <Icon type={valut.icon} className=" w-8 h-8" />
                  </div>
                  <div className=" text-gray-600  w-[100%] text-wrap break-words flex-grow">
                    {valut.info}
                  </div>
                  <div className="flex justify-between items-center ">
                    <Icon
                      type="icon-set"
                      className=" text-gray-400"
                      onClick={() => {
                        setEditPanelTitle('编辑密码库')
                        form.resetFields()
                        setCurInfo(valut)
                        setShowType(ModalType.Edit)
                        form.setFieldsValue(valut)
                        setShowDel(true)
                        setShowEdit(true)
                      }}
                    ></Icon>

                    <Icon
                      type="icon-goto"
                      className=" text-gray-400"
                      onClick={() => {
                        history.push(`${PagePath.Admin_valutitem}/${valut.id}`)
                      }}
                    ></Icon>
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination
            style={{ textAlign: 'center' }}
            defaultCurrent={cur_page}
            defaultPageSize={page_size}
            total={appstore.vaults.length}
            // showTotal={(total) => `共${total}个`}
            // showSizeChanger
            onChange={(page) => {
              setCurPage(page)
            }}
            onShowSizeChange={(current, size) => {
              setPageNum(size)
            }}
          />
        </div>
      </div>
      {show_edit && (
        <Modal
          width={400}
          title={edit_panel_title}
          open={show_edit}
          onOk={() => {
            form.validateFields().then(async (values) => {
              console.log(values)
              if (show_type === ModalType.Edit) {
                values.id = cur_info.id
                await appstore.UpdateValut(cur_info, values as Vault).catch((err) => {
                  messageApi.error(err.message, 5)
                })
              } else if (show_type === ModalType.Add) {
                await appstore.AddValut(values as Vault).catch((err) => {
                  messageApi.error(err.message, 5)
                })
              }
              await getAllData()
              setShowEdit(false)
            })
          }}
          onCancel={() => {
            message.error('exit', 0)
            setShowEdit(false)
          }}
          footer={(_, { OkBtn, CancelBtn }) => (
            <>
              {show_del && (
                <Button
                  onClick={async () => {
                    await appstore.DeleteValut(cur_info.id).catch((err) => {
                      messageApi.error(err.message, 5)
                    })
                    await getAllData()
                    setShowEdit(false)
                  }}
                >
                  删除
                </Button>
              )}
              <CancelBtn />
              <OkBtn />
            </>
          )}
        >
          <Form {...formItemLayout} form={form}>
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input></Input>
            </Form.Item>
            <Form.Item label="图标" name="icon" rules={[{ required: true, message: '请输入图标' }]}>
              <Select>
                {Object.keys(Icon_type).map((key) => {
                  return (
                    <Select.Option key={key} value={Icon_type[key]}>
                      <Icon type={Icon_type[key]}></Icon>
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item label="信息" name="info" rules={[{ required: true, message: '请输入信息' }]}>
              <TextArea showCount style={{ height: 120 }}></TextArea>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  )
}

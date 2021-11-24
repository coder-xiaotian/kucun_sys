import { Button, Table, message } from 'antd'
import Excel from 'exceljs'
import { useState, useEffect } from 'react'
const { ipcRenderer } = window.require('electron')

type DataPreviewProps = {
  laihuoFile: ArrayBuffer
  fahuoFile: ArrayBuffer
  colorMap: Record<string, string>
  reupload: () => void
}
export default (props: DataPreviewProps) => {
  const [loading, setLoading] = useState(false)
  const [kucunWb, setKucunWb] = useState<Excel.Workbook>()
  // 要预览的数据
  const [dataList, setDataList] = useState<any[]>([])
  async function initData() {
    const jinhuoWorkbook = await new Excel.Workbook().xlsx.load(props.laihuoFile)

    const addressRE = /^([A-Z]+)(\d+)$/
    const emptySymbolRE = /\s/g
    const colorNumRE = /[A-Z\d\s#-]+/
    const jinhuoMap = {}
    const colorMap = props.colorMap
    jinhuoWorkbook.eachSheet((sheet) => {
      const row1 = sheet.getRow(1)
      const sheetName = sheet.name.replace(emptySymbolRE, '')
      sheet.eachRow((row, rowNum) => {
        if (rowNum <= 1) return

        row.eachCell((cell, cellNum) => {
          if (cellNum <= 1) return

          // @ts-ignore
          const colorCN = row.getCell(1).value.replace(colorNumRE, '').replace(emptySymbolRE, '')
          // @ts-ignore
          const colKey = addressRE.exec(cell.address)[1]
          const size = row1.getCell(colKey).value
          // @ts-ignore
          const key = `${sheetName}-${colorMap[colorCN]}-${size.replace(emptySymbolRE, '')}`
          // @ts-ignore
          const val = jinhuoMap[key]
          if (val && val >= 0) {
            // @ts-ignore
            jinhuoMap[key] += cell.value
          } else {
            // @ts-ignore
            jinhuoMap[key] = cell.value
          }
        })
      })
    })

    const dataList: any[] = []
    // @ts-ignore
    function createKucunWb(jinhuoMap) {
      const kucunWorkbook = new Excel.Workbook()
      kucunWorkbook.properties.date1904 = true
      const sheet = kucunWorkbook.addWorksheet('库存')
      sheet.columns = [
        { header: '卖家SKU', key: 'sku', width: 20 },
        { header: 'ASIN', key: 'asin', width: 20 },
        { header: '进货总数', key: 'jinhuoNum', width: 20 },
        { header: '发货总数', key: 'fahuoNum', width: 20 },
        { header: '仓库剩余', key: 'remain', width: 20 },
      ]

      const skuMap = {}
      Object.keys(jinhuoMap).forEach((key, index) => {
        // @ts-ignore
        skuMap[key] = index + 2
        const row = {
          sku: key,
          jinhuoNum: jinhuoMap[key],
          fahuoNum: 0,
          remain: jinhuoMap[key]
        }
        dataList.push(row)
        sheet.addRow(row)
      })

      return [kucunWorkbook, skuMap]
    }
    // 读取出货表计算库存并输出到库存表
    const [kucunWorkbook, skuMap] = createKucunWb(jinhuoMap)
    // @ts-ignore
    const kucunSheet = kucunWorkbook.getWorksheet('库存')
    const fahuoWorkbook = await new Excel.Workbook().xlsx.load(props.fahuoFile)
    fahuoWorkbook.eachSheet(sheet => {
      sheet.eachRow((row, rowNum) => {
        if (rowNum <= 1) return

        let sku = row.getCell(1).value
        // @ts-ignore
        sku = sku.split('-').slice(0, 3).join('-')
        // @ts-ignore
        const index = skuMap[sku]
        const data = dataList[index - 2]
        const kucunRow = kucunSheet.getRow(index)
        const asin = row.getCell('B').value
        kucunRow.getCell('B').value = asin
        data.asin = asin

        // 累加发货数
        let fahuoNum = kucunRow.getCell('D').value
        kucunRow.getCell('D').value = fahuoNum = fahuoNum + row.getCell('C').value
        data.fahuoNum = fahuoNum

        // 计算库存数
        const remain = kucunRow.getCell('remain').value - fahuoNum
        kucunRow.getCell('E').value = remain
        data.remain = remain
      })
    })
    // @ts-ignore
    setKucunWb(kucunWorkbook)
    setDataList(dataList)
  }

  useEffect(() => {
    setLoading(true)
    initData().then(() => setLoading(false)).catch(() => setLoading(false))
  }, [])

  async function handleExport() {
    const buffer = await kucunWb?.xlsx.writeBuffer()
    const a = document.createElement('a')
    a.download = '库存.xlsx'
    a.href = URL.createObjectURL(new Blob([buffer!]))
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    message.success('导出成功!')
  }

  return (
    <div className="w-full px-20 py-4 text-right">
      <Table rowKey="sku" loading={loading} scroll={{y: 300}} dataSource={dataList} pagination={false} columns={[{
                        title: '卖家SKU',
                        dataIndex: 'sku'
                      }, {
                        title: 'ASIN',
                        dataIndex: 'asin'
                      }, {
                        title: '进货总数',
                        dataIndex: 'jinhuoNum'
                      }, {
                        title: '发货总数',
                        dataIndex: 'fahuoNum'
                      }, {
                        title: '仓库剩余',
                        dataIndex: 'remain'
                      }]}
      ></Table>
      <Button disabled={loading} className="mt-4" onClick={props.reupload}>重新上传</Button>
      <Button disabled={loading} className="mt-4 ml-4" type="primary" onClick={handleExport}>导出excel</Button>
    </div>
  )
}

import { ModalType } from '@common/gloabl'
import { Rule } from 'antd/es/form'
import React, { HtmlHTMLAttributes } from 'react'

export interface prop_field {
  [k: string]: any
  placeholder?: string
}

export interface FiledProps {
  value?: any
  onChange?: (value: any) => void
  show_type?: ModalType
  className?: string
}

export class FieldInfo {
  field_name: string = ''
  render: (pros: FiledProps) => React.ReactElement //React.ElementType
  label?: string = ''
  //edit 相关
  edit_rules?: Rule[] = []
  edit_props?: prop_field = {}
}

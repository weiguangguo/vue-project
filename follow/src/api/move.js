import {getRequest, postRequest} from './http'
import {storage} from 'common/js/common'

function setData (data) {
  let reSetData = Object.assign({}, storage('loginData'), data)
  return reSetData
}
// 获取我的任务数据
export function getMoveData (data, fn) {
  const resetData = setData(data)
  getRequest('/terminal/me/findByMove', resetData, (res) => {
    fn(res)
  })
}
// 是否收藏
export function changeFavor ({openid, isFavor}, fn) {
  let action = (isFavor ? 'remove' : 'add')
  const reSetData = setData({
    action, openid
  })
  postRequest('/terminal/user/favor', reSetData, (res) => {
    fn(res)
  })
}
// 获取导航数据
export function getNavData (data, fn) {
  const resetData = setData(data)
  getRequest('/terminal/followCount/findByMove', resetData, (res) => {
    fn(res)
  })
}

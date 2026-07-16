/** 价格统一以「分」存储，展示时转换 */

export function fenToYuan(cents: number): number {
  return cents / 100;
}

export function formatPrice(cents: number): string {
  const yuan = cents / 100;
  return Number.isInteger(yuan) ? `¥${yuan}` : `¥${yuan.toFixed(2)}`;
}

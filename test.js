/*
 * Quantumult X - STATUS 信息解析脚本
 * 功能：解析订阅开头的 STATUS=xxx 和 REMARKS=xxx 内容，并显示在 QX 的流量信息界面
 * 支持：混合 Base64 / URL-Safe Base64 / 非标准编码 / 多段编码
 */

const raw = $resource.content;

// 尝试自动解码 Base64（支持 URL-safe）
function tryDecodeBase64(str) {
  try {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = str.length % 4;
    if (pad) str += "=".repeat(4 - pad);
    return $native.base64Decode(str);
  } catch (e) {
    return null;
  }
}

let decoded = tryDecodeBase64(raw);
if (!decoded) decoded = raw;

// 进一步尝试再解一次（你的订阅经常双层编码）
let decoded2 = tryDecodeBase64(decoded);
if (decoded2) decoded = decoded2;

// 匹配 STATUS=xxxxxx
let statusLine = decoded.match(/STATUS=([^\n]+)/i);
let remarkLine = decoded.match(/REMARKS=([^\n]+)/i);

let status = statusLine ? statusLine[1].trim() : "未知";
let remarks = remarkLine ? remarkLine[1].trim() : "节点订阅";

// 解析流量格式
// 你机场一般是：STATUS=已用XX/总XX（剩余XX） 到期：2025-xx-xx
let expire = status.match(/(\d{4}-\d{1,2}-\d{1,2})/);
let used = status.match(/已用\s*([0-9\.A-Z]+)/);
let total = status.match(/总\s*([0-9\.A-Z]+)/);
let left = status.match(/剩余\s*([0-9\.A-Z]+)/);

let dashboard = `✦ ${remarks}\n`;

if (used) dashboard += `已用：${used[1]}\n`;
if (total) dashboard += `总量：${total[1]}\n`;
if (left) dashboard += `剩余：${left[1]}\n`;
if (expire) dashboard += `到期：${expire[1]}\n`;

$resource.notify(dashboard);

// 输出不更改的节点列表
$done({ content: raw });
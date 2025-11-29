// 修复 Markdown 链接格式工具函数

/**
 * 修复不完整的 Markdown 链接格式
 * 将 [文本](URL 补充为 [文本](URL)
 * @param content Markdown 内容
 * @returns 修复后的内容
 */
export const fixMarkdownLinks = (content: string): string => {
  if (!content) {
    return content;
  }

  let fixedContent = content;
  
  // 方法：查找所有不完整的链接模式 [文本](URL（缺少右括号）
  // 使用正则匹配：查找 [文本](URL 但后面没有 ) 的情况
  
  // 从后往前查找并修复，避免索引偏移
  let lastIndex = fixedContent.length;
  const patterns: Array<{ start: number; end: number; text: string; url: string }> = [];
  
  // 查找所有可能的链接模式
  const linkPattern = /\[([^\]]+)\]\(([^)]+)/g;
  let match;
  
  while ((match = linkPattern.exec(fixedContent)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    const text = match[1];
    const url = match[2];
    
    // 检查后面是否有右括号
    const afterMatch = fixedContent.substring(end, end + 1);
    
    // 如果后面没有右括号，且不是换行符，则需要修复
    if (afterMatch !== ')' && afterMatch !== '\n' && afterMatch !== '\r') {
      // 检查是否在代码块中（简单检查）
      const beforeText = fixedContent.substring(0, start);
      const codeBlockCount = (beforeText.match(/```/g) || []).length;
      
      // 如果不在代码块中，记录需要修复的位置
      if (codeBlockCount % 2 === 0) {
        patterns.push({ start, end, text, url });
      }
    }
  }
  
  // 从后往前替换，避免索引偏移
  for (let i = patterns.length - 1; i >= 0; i--) {
    const pattern = patterns[i];
    fixedContent = 
      fixedContent.substring(0, pattern.end) + 
      ')' + 
      fixedContent.substring(pattern.end);
  }
  
  // 更简单的方法：直接替换行尾的不完整链接
  fixedContent = fixedContent.replace(/\[([^\]]+)\]\(([^)\n\r]+)(?=[\n\r]|$)/g, (match, text, url) => {
    // 如果URL不包含右括号，补充一个
    if (!url.includes(')')) {
      return `[${text}](${url})`;
    }
    return match;
  });
  
  return fixedContent;
};


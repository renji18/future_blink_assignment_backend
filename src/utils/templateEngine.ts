export const replacePlaceholders = (
  template: string,
  leadData: Record<string, any>,
): string => {
  return template.replace(/{{\s*(\w+\s*\w*)\s*}}/g, (_, key) => {
    const normalizedKey = key.trim().replace(/\s+/g, '').toLowerCase();

    for (const leadKey in leadData) {
      if (leadKey.toLowerCase().replace(/\s+/g, '') === normalizedKey) {
        return leadData[leadKey] ?? '';
      }
    }

    return `{{${key}}}`;
  });
};

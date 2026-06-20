import sanitize from 'sanitize-html';

export function cleanHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: sanitize.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['https', 'mailto'],
    disallowedTagsMode: 'discard',
  });
}

type Props = {
  html: string;
  className?: string;
};

export function MarkdownHtml({ html, className }: Props) {
  return (
    <div
      className={`prose-void max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

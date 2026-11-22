interface Props {
  code: string;
}

export default function ChordSymbol({ code }: Props) {
  const match = /^([A-Z]+)(53|64|65|43)$/.exec(code);

  if (!match) return <>{code}</>;

  const [, prefix, figures] = match;

  return (
    <span className="chord-symbol" aria-label={code}>
      <span>{prefix}</span>

      <span className="chord-figures" aria-hidden="true">
        <span>{figures[0]}</span>
        <span>{figures[1]}</span>
      </span>
    </span>
  );
}

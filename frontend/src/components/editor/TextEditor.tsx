import { CalculatedColumn } from "react-data-grid";

export interface RenderEditCellProps<TRow, TSummaryRow = unknown> {
  column: CalculatedColumn<TRow, TSummaryRow>;
  row: TRow;
  rowIdx: number;
  onRowChange: (row: TRow, commitChanges?: boolean) => void;
  onClose: (commitChanges?: boolean, shouldFocusCell?: boolean) => void;
}

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export default function TextEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<TRow, TSummaryRow>) {
  return (
    <input
      className="appearance-none box-border w-full h-full py-0 px-1.5 border-2 border-solid border-[#ccc] align-top bg-[var(--rdg-background-color)] focus:border-[var(--rdg-selection-color)] focus:outline-none placeholder:text-[#999] placeholder:opacity-100"
      ref={autoFocusAndSelect}
      value={row[column.key as keyof TRow] as unknown as string}
      onChange={(event) =>
        onRowChange({ ...row, [column.key]: event.target.value })
      }
      onBlur={() => onClose(true, false)}
    />
  );
}

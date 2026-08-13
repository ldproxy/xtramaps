import { Row } from "reactstrap";

export interface SeparatorProps {
  section?: boolean;
  first?: boolean;
}

function Separator({ section = false, first = false }: SeparatorProps) {
  return (
    <Row
      style={{
        paddingTop: section ? "5px" : "2px",
        marginTop: section && !first ? "5px" : undefined,
        borderTop: section && !first ? "1px solid #ddd" : undefined,
      }}
    />
  );
}

Separator.displayName = "Separator";

export default Separator;

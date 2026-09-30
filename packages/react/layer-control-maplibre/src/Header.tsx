import type { ReactNode } from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import CollapseButton from "./CollapseButton";

interface HeaderPlainProps {
  label?: string;
  level?: number;
}

function HeaderPlain({ label, level = 0 }: HeaderPlainProps) {
  return (
    <span style={{ whiteSpace: "nowrap", marginLeft: `${level * 20}px` }}>
      {label}
    </span>
  );
}

export interface HeaderCheckProps {
  id: string;
  level?: number;
  radioGroup?: string;
  isControlable?: boolean;
  isSelected: (id: string, radioGroup?: string) => boolean;
  onSelect: (id: string, radioGroup?: string) => void;
  children: ReactNode;
}

export function HeaderCheck({
  id,
  level = 0,
  radioGroup,
  isControlable = true,
  isSelected,
  onSelect,
  children,
}: HeaderCheckProps) {
  return isControlable ? (
    <FormGroup check style={{ marginLeft: `${level * 20}px` }}>
      <Label check style={{ display: "flex", alignItems: "center" }}>
        <Input
          style={{
            position: "relative",
            marginRight: "5px",
            marginTop: "0",
          }}
          type={radioGroup ? "radio" : "checkbox"}
          name={radioGroup}
          checked={isSelected(id, radioGroup)}
          onChange={(e) => {
            e.target.blur();
            onSelect(id, radioGroup);
          }}
        />

        {children}
      </Label>
    </FormGroup>
  ) : (
    <div
      style={{
        marginLeft: `${level * 20}px`,
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

HeaderCheck.displayName = "HeaderCheck";

export interface HeaderProps {
  id: string;
  label?: string;
  level?: number;
  check?: boolean;
  isControlable?: boolean;
  isOpened: (id: string) => boolean;
  onOpen: (id: string) => void;
  isSelected: (id: string, radioGroup?: string) => boolean;
  onSelect: (id: string, radioGroup?: string) => void;
}

function Header({
  id,
  label,
  level = 0,
  check = false,
  isControlable = true,
  isOpened,
  onOpen,
  isSelected,
  onSelect,
}: HeaderProps) {
  return (
    <Row
      key={id}
      style={{
        flexWrap: "nowrap",
      }}
    >
      <Col xs="10" style={{ display: "flex", alignItems: "center" }}>
        {check ? (
          <HeaderCheck
            id={id}
            level={level}
            isControlable={isControlable}
            isSelected={isSelected}
            onSelect={onSelect}
          >
            <HeaderPlain label={label || id} />
          </HeaderCheck>
        ) : (
          <HeaderPlain label={label || id} level={level} />
        )}
      </Col>
      <Col xs="2">
        <CollapseButton
          collapsed={!isOpened(id)}
          toggleCollapsed={() => onOpen(id)}
        />
      </Col>
    </Row>
  );
}

Header.displayName = "Header";

export default Header;

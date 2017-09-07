// NOTE: must be bitmask compatible (start at 1)
enum TokenKind {
  Default = 0b0001,
  Opens = 0b0010,
  Closes = 0b0100
}

export default TokenKind;

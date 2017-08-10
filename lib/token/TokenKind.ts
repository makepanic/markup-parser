// NOTE: must be bitmask compatible (start at 1)
enum TokenKind {
  Default =       0b001,
  Opens =         0b010,
  Closes =        0b100,
}

export default TokenKind;

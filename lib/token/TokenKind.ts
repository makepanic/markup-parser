// NOTE: must be bitmask compatible (start at 1)
/**
 * Enum that represents the kind of a token.
 * This means a token can be of kind Opens and Closes if Open | Closes is set as its kind
 */
enum TokenKind {
  Default = 0b0001,
  Opens = 0b0010,
  Closes = 0b0100
}

export default TokenKind;

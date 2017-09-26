import test from "ava";
import RuleProperty from "../../lib/rule/RuleProperty";
import Node from "../../lib/Node";
import TextRule from "../../lib/rule/TextRule";
import Rule from "../../lib/rule/Rule";

const Type = {
  Foo: 0,
  HereRight: 1,
  HereLeft: 2,
  Text: 3
};

const identityTextRule = new TextRule(Type.Text, a => a);

test("appendChild", function(t) {
  const parentNode = new Node();
  const newNode = new Node();

  parentNode.appendChild(newNode);

  t.is(parentNode.children.length, 1);
  t.is(parentNode.children[0], newNode);
  t.is(newNode.parentNode, parentNode);
});

test("expands TextRule", function(t) {
  {
    const rootNode = new Node();
    rootNode.appendChild(new Node(identityTextRule, 0, 3));
    t.is(rootNode.expand("HelloBaz"), "Hel");
  }

  {
    const rootNode = new Node();
    rootNode.appendChild(new Node(identityTextRule, 0, 3));
    rootNode.appendChild(new Node(identityTextRule, 3, 8));
    t.is(rootNode.expand("HelloBaz"), "HelloBaz");
  }

  {
    const rootNode = new Node();
    rootNode.appendChild(new Node(identityTextRule, 0, 3));
    rootNode.appendChild(new Node(identityTextRule, 4, 8));
    t.is(rootNode.expand("HelloBaz"), "HeloBaz");
  }
});

test("expands text", function(t) {
  const rootNode = new Node();

  rootNode.appendChild(new Node(identityTextRule, 0, 3));
  rootNode.appendChild(
    new Node(
      new Rule(Type.Foo, undefined, RuleProperty.None, () => "Foobar"),
      3,
      4
    )
  );
  rootNode.appendChild(new Node(identityTextRule, 4, 8));

  t.is(rootNode.expand("HelloBaz"), "HelFoobaroBaz");
});

test("expands block rules", function(t) {
  const rootNode = new Node();

  rootNode.appendChild(new Node(identityTextRule, 0, 10));
  rootNode.appendChild(
    new Node(
      new Rule(
        Type.HereLeft,
        Type.HereRight,
        RuleProperty.Block,
        str => `(☞ﾟヮﾟ)☞ ${str} ☜(ﾟヮﾟ☜)`
      ),
      10,
      14
    )
  );
  rootNode.appendChild(new Node(identityTextRule, 14, 42));

  t.is(
    rootNode.expand("I'm sorry Dave, I'm afraid I can't do that"),
    "I'm sorry (☞ﾟヮﾟ)☞ Dave ☜(ﾟヮﾟ☜), I'm afraid I can't do that"
  );
});

test("expands nested nodes", function(t) {
  const rootNode = new Node();
  const childNode = new Node(
    new Rule(
      Type.HereLeft,
      Type.HereRight,
      RuleProperty.Block,
      str => `(☞ﾟヮﾟ)☞ ${str} ☜(ﾟヮﾟ☜)`
    ),
    10,
    14
  );

  rootNode.appendChild(new Node(identityTextRule, 0, 10));
  rootNode.appendChild(childNode);
  childNode.appendChild(new Node(identityTextRule, 10, 14));
  rootNode.appendChild(new Node(identityTextRule, 14, 42));

  t.is(
    rootNode.expand("I'm sorry Dave, I'm afraid I can't do that"),
    "I'm sorry (☞ﾟヮﾟ)☞ Dave ☜(ﾟヮﾟ☜), I'm afraid I can't do that"
  );
});

test("expand always returns a string even without rule", t => {
  const node = new Node();
  t.is(node.expand("foo"), "");
});

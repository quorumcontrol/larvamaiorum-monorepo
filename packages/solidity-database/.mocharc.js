module.exports = {
  recursive: true,
  require: ['ts-node/register', "test/test-helper.ts"],
  spec: './test/**/*.test.ts',
}
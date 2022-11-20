import { FunctionData, SupportedLanguages } from '../../types'

export function toUserCode(
  fnData: FunctionData,
  lang: SupportedLanguages,
  memoize: boolean
) {
  const declare = buildDeclare(lang)

  const globalVarLines = (fnData.globalVariables || []).map((param) =>
    declare.variable(param.name, param.value)
  )

  const paramsNames = (fnData.params || []).map((param) => param.name)
  const paramsInitialValues = (fnData.params || []).map(
    (param) => scapeDoubleQuotes(param.initialValue)
  )

  const plainCode = [
    ...globalVarLines,
    '',
    declare.function('_fn', paramsNames, scapeDoubleQuotes(fnData.body)),
    '',
    declare.variable('fnParamsValues', declare.array(paramsInitialValues)),
    declare.variable('memoize', declare.boolean(memoize)),
  ].join('\n')

  return plainCode
}

/** HOC to build a declare function, that outputs a declaration (string) for the specified language */
const buildDeclare = (lang: SupportedLanguages) => ({
  variable: (name: string, value: string) => {
    if (lang === 'node') return `const ${name} = ${value}`
    if (lang === 'python') return `${name} = ${value}`
    return ''
  },
  boolean: (value: boolean) => {
    if (lang === 'node') return value === true ? 'true' : 'false'
    if (lang === 'python') return value === true ? 'True' : 'False'
    return ''
  },
  array: (values: string[]) => {
    return `[${values.join(', ')}]`
  },
  function: (name: string, params: string[], body: string) => {
    if (lang === 'node')
      return [
        `function ${name}(${params.join(', ')}) {`,
        indent(body),
        '}',
      ].join('\n')
    if (lang === 'python')
      return [
        `def ${name}(${params.join(', ')}):`,
        indent(body)
      ].join('\n')
    return ''
  },
})

const indent = (code: string) =>
  code
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')

const scapeDoubleQuotes = (code: string) => code.replace(/"/g, '\\"')
import { APIGatewayProxyHandler } from 'aws-lambda'
import debug from 'debug'
import buildRunner from './runner'
import { TreeViewerData } from './types'
import { safeStringify } from './utils/safe-json'
import { validateEventDynamically } from './validations/event'

const log = debug('app:handler')

export const handler: APIGatewayProxyHandler = async (event) => {
  log('Event received: %O', event)

  const result = validateEventDynamically(event)
  if (result.isError())
    return badRequest(result.value)
  
  const body = result.value

  try {
    const run = buildRunner(body.lang, body.options)
    const treeViewerData = await run(body.functionData)

    if (treeViewerData.isError())
      return unprocessableEntity(treeViewerData.value.reason)

    return ok(treeViewerData.value)
  } catch (e) {
    log('Unexpected error: %O', e)
    return internalServerError('Internal server error')
  }
}

const ok = (body: TreeViewerData) => result(200, body)
const badRequest = (reason: string) => result(400, { reason })
const unprocessableEntity = (reason: string) => result(422, { reason })
const internalServerError = (reason: string) => result(500, { reason })

const result = (statusCode: number, body: Record<string, any>) => ({
  statusCode,
  body: safeStringify(body),
})

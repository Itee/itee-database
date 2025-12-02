/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

// Base class
export * from './AbstractHTTPError.js'

// 1xx - Information
// 2xx - Success
// 3xx - Redirect
// 4xx - Client error
export * from './BadRequestError.js'
export * from './BadMappingError.js'
export * from './BlockedByWindowsParentalControlsError.js'
export * from './ClientClosedRequestError.js'
export * from './ConflictError.js'
export * from './ExpectationFailedError.js'
export * from './ForbiddenError.js'
export * from './GoneError.js'
export * from './HTTPRequestSentToHTTPSPortError.js'
export * from './ImATeapotError.js'
export * from './LengthRequiredError.js'
export * from './LockedError.js'
export * from './MethodFailureError.js'
export * from './MethodNotAllowedError.js'
export * from './NoResponseError.js'
export * from './NotAcceptableError.js'
export * from './NotFoundError.js'
export * from './PaymentRequiredError.js'
export * from './PreconditionFailedError.js'
export * from './PreconditionRequiredError.js'
export * from './ProxyAuthenticationRequiredError.js'
export * from './RequestEntityTooLargeError.js'
export * from './RequestHeaderFieldsTooLargeError.js'
export * from './RequestRangeUnsatisfiableError.js'
export * from './RequestTimeOutError.js'
export * from './RetryWithError.js'
export * from './SSLCertificateError.js'
export * from './SSLCertificateRequiredError.js'
export * from './TooManyRequestsError.js'
export * from './UnauthorizedError.js'
export * from './UnavailableForLegalReasonsError.js'
export * from './UnorderedCollectionError.js'
export * from './UnprocessableEntityError.js'
export * from './UnrecoverableError.js'
export * from './UpgradeRequiredError.js'


// 5xx - Server error
export * from './ATimeoutOccuredError.js'
export * from './BadGatewayError.js'
export * from './BandwidthLimitExceededError.js'
export * from './ConnectionTimedOutError.js'
export * from './GatewayTimeOutError.js'
export * from './HTTPVersionNotSupportedError.js'
export * from './InsufficientStorageError.js'
export * from './InternalServerError.js'
export * from './InvalidSSLCertificateError.js'
export * from './LoopDetectedError.js'
export * from './NetworkAuthenticationRequiredError.js'
export * from './NotExtendedError.js'
export * from './NotImplementedError.js'
export * from './OriginIsUnreachableError.js'
export * from './RailgunError.js'
export * from './ServiceUnavailableError.js'
export * from './SSLHandshakeFailedError.js'
export * from './UnknownError.js'
export * from './VariantAlsoNegotiatesError.js'
export * from './WebServerIsDownError.js'

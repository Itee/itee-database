/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

// Base class
export * from './AbstractHTTPError'

// 1xx - Information
// 2xx - Success
// 3xx - Redirect
// 4xx - Client error
export * from './BadRequestError'
export * from './BadMappingError'
export * from './BlockedByWindowsParentalControlsError'
export * from './ClientClosedRequestError'
export * from './ConflictError'
export * from './ExpectationFailedError'
export * from './ForbiddenError'
export * from './GoneError'
export * from './HTTPRequestSentToHTTPSPortError'
export * from './ImATeapotError'
export * from './LengthRequiredError'
export * from './LockedError'
export * from './MethodFailureError'
export * from './MethodNotAllowedError'
export * from './NoResponseError'
export * from './NotAcceptableError'
export * from './NotFoundError'
export * from './PaymentRequiredError'
export * from './PreconditionFailedError'
export * from './PreconditionRequiredError'
export * from './ProxyAuthenticationRequiredError'
export * from './RequestEntityTooLargeError'
export * from './RequestHeaderFieldsTooLargeError'
export * from './RequestRangeUnsatisfiableError'
export * from './RequestTimeOutError'
export * from './RetryWithError'
export * from './SSLCertificateError'
export * from './SSLCertificateRequiredError'
export * from './TooManyRequestsError'
export * from './UnauthorizedError'
export * from './UnavailableForLegalReasonsError'
export * from './UnorderedCollectionError'
export * from './UnprocessableEntityError'
export * from './UnrecoverableError'
export * from './UpgradeRequiredError'


// 5xx - Server error
export * from './ATimeoutOccuredError'
export * from './BadGatewayError'
export * from './BandwidthLimitExceededError'
export * from './ConnectionTimedOutError'
export * from './GatewayTimeOutError'
export * from './HTTPVersionNotSupportedError'
export * from './InsufficientStorageError'
export * from './InternalServerError'
export * from './InvalidSSLCertificateError'
export * from './LoopDetectedError'
export * from './NetworkAuthenticationRequiredError'
export * from './NotExtendedError'
export * from './NotImplementedError'
export * from './OriginIsUnreachableError'
export * from './RailgunError'
export * from './ServiceUnavailableError'
export * from './SSLHandshakeFailedError'
export * from './UnknownError'
export * from './VariantAlsoNegotiatesError'
export * from './WebServerIsDownError'

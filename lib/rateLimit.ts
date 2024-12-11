import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // limit each IP to 10 requests per windowMs
})

export const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 5, // allow 5 requests per minute at full speed
  delayMs: 500 // add 500ms of delay per request above 5
}) 
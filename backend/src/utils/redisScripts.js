
export const RESERVE_SLOT_LUA = `
  local available_key = KEYS[1]
  local hold_key = KEYS[2]
  local requested_seats = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])

  local exists = redis.call('exists', available_key)
  if exists == 0 then
    return {-1, 0} 
  end

  local current_available = tonumber(redis.call('get', available_key))

  if current_available >= requested_seats then
    redis.call('decrby', available_key, requested_seats)
    redis.call('setex', hold_key, ttl, requested_seats)
    return {1, current_available - requested_seats} 
  else
    return {0, current_available} 
  end
`;

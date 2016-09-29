'use strict';

module.exports = function simplifyService (full) {
  var address = full.Service.Address;
  // When encountering an empty Address field for a service, use the Address
  // field of the agent node associated with that instance of the service.
  //    https://www.consul.io/docs/agent/http/agent.html#agent_service_register
  if (!address) address = full.Node.Address;
  return {
    name: full.Service.Service,
    host: address,
    port: full.Service.Port
  };
};

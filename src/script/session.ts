const sessionId =
  document.location.hash.length > 0
    ? document.location.hash.substring(1)
    : Date.now().toString(36);

document.location.hash = sessionId;

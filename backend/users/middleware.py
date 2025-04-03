from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model


# class JWTAuthMiddleware(BaseMiddleware):
   
#     async def __call__(self, scope, receive, send):
    
#         token = self.get_token_from_scope(scope)
        
#         if token != None:
#             user_id = await self.get_user_from_token(token) 
#             if user_id:
#                 scope['user_id'] = user_id

#             else:
#                 scope['error'] = 'Invalid token'

#         if token == None:
#             scope['error'] = 'provide an auth token'    
    
                
#         return await super().__call__(scope, receive, send)

#     def get_token_from_scope(self, scope):
#         headers = dict(scope.get("headers", []))
        
#         auth_header = headers.get(b'authorization', b'').decode('utf-8')
        
#         if auth_header.startswith('Bearer '):
#             return auth_header.split(' ')[1]
        
#         else:
#             return None
        
#     @database_sync_to_async
#     def get_user_from_token(self, token):
#             try:
#                 access_token = AccessToken(token)
#                 return access_token['user_id']
#             except:
#                 return None



class JWTAuthMiddleware(BaseMiddleware):
   
    async def __call__(self, scope, receive, send):
        # Get token from URL query parameters or headers
        token = self.get_token_from_scope(scope)
        
        if token != None:
            user_id = await self.get_user_from_token(token) 
            if user_id:
                scope['user_id'] = user_id
            else:
                scope['error'] = 'Invalid token'
        else:
            # First try to get token from initial WebSocket message
            original_receive = receive
            
            async def receive_wrapper():
                message = await original_receive()
                
                # Only check the first message for authentication
                if message['type'] == 'websocket.connect':
                    return message
                
                if message['type'] == 'websocket.receive' and not scope.get('user_id'):
                    try:
                        data = json.loads(message['text'])
                        if data.get('type') == 'authentication':
                            token = data.get('token')
                            if token:
                                user_id = await self.get_user_from_token(token)
                                if user_id:
                                    scope['user_id'] = user_id
                                else:
                                    scope['error'] = 'Invalid token'
                    except json.JSONDecodeError:
                        pass
                
                return message
            
            receive = receive_wrapper
            
            if not scope.get('user_id'):
                scope['error'] = 'provide an auth token'
    
        return await super().__call__(scope, receive, send)

    def get_token_from_scope(self, scope):
        # Try to get token from headers
        headers = dict(scope.get("headers", []))
        auth_header = headers.get(b'authorization', b'').decode('utf-8')
        
        if auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # If not in headers, check query params
        query_string = scope.get('query_string', b'').decode('utf-8')
        if query_string:
            params = parse_qs(query_string)
            token = params.get('token', [None])[0]
            if token:
                return token
        
        return None
        
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            return access_token['user_id']
        except:
            return None
from django.http import JsonResponse

class ActiveUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # If user is authenticated and inactive
        if request.user.is_authenticated and not request.user.is_active:
            print("middleware is working......")
            return JsonResponse(
                {"detail": "User has been blocked by admin."}, status=403
            )

        # Continue processing the request
        return self.get_response(request)

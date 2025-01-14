from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
from .serializers import *
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.contrib.auth.hashers import make_password
from .tasks import send_email
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now
from django.http import HttpResponseRedirect
from .utils import *
from rest_framework.parsers import MultiPartParser,FormParser
from django.db.models import Q
from datetime import datetime



# Create your views here.


##Account Creation
class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        existing_user = Users.objects.filter(email=email).first()

        if existing_user:
            print(f"Inside....existing user : {existing_user}************************************")

            if not existing_user.is_email_verified:
                send_email.delay(existing_user.id)
                return Response(
                    {'message': ['This email already exists but is not verified. Please verify using the otp/ link send to your email.']},
                    status=status.HTTP_409_CONFLICT
                )
            else:
                return Response({'email': ['This email is already registered']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=request.data)
        print(f"Serializer: {serializer}********************NEW USER******************************")
        print(f"is_valid :   {serializer.is_valid()}********************************")
        if serializer.is_valid():
            user = serializer.save()  # User is inactive until email is verified
  
            # Send OTP email asynchronously
            send_email.delay(user.id)


            return Response({'message': 'OTP has been sent to your Email. Please verify your email.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


##Verification of Email (Signup)
class VerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        

        serializer = VerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        otp = request.data.get('otp')
        token = request.query_params.get('token')
        email = request.data.get('email')

        try:
            user = Users.objects.get(email=email)
            verification = Verification.objects.get(user=user)

            if verification.is_verified:
                return Response({"message": "User is already verified."}, status=status.HTTP_200_OK)

            if verification.is_expired():
                print(verification.is_expired())
                return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_410_GONE)
            

            # Verify OTP or token
            if otp and otp == verification.otp:
                verification.is_verified = True
                user.is_email_verified = True
                user.save()
                verification.save()
                return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

            elif token and token == verification.token:
                verification.is_verified = True
                user.is_email_verified = True
                user.save()
                verification.save()
                return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid OTP or token."}, status=status.HTTP_400_BAD_REQUEST)

        except Users.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Verification.DoesNotExist:
            return Response({"error": "No verification record found."}, status=status.HTTP_404_NOT_FOUND)


class VerificationMagicLinkView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        token = request.query_params.get('token')
        print(f"Received token: {token}")  # Logs the received token

        if not token:
            print("Token is missing.")
            return Response({"error": "Token is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = Verification.objects.get(token=token)

            if verification.is_verified:
                print(f"Token {token} already verified.")
                return HttpResponseRedirect('http://localhost:3000/login')

            if verification.is_expired():
                print(f"Token {token} has expired.")
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_410_GONE)

            verification.is_verified = True
            verification.user.is_email_verified = True
            verification.user.save()
            verification.save()
            print(f"Token {token} verified successfully.")
            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)

        except Verification.DoesNotExist:
            print(f"Token {token} does not exist.")
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_404_NOT_FOUND)





##Resend OTP
class ResendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.get(email=email)

            if not user.is_email_verified:  # Check if the user is not verified
                # Trigger resend OTP via Celery task and pass 'force=True' to regenerate OTP
                verification = Verification.objects.get(user=user)
                verification.generate_otp(force=True)  # Regenerate OTP
                send_email.delay(user.id)  # Send the updated OTP

                return Response({"message": "OTP has been resent to your email. Please verify."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        except Users.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)





##Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        print(serializer.is_valid(),"********************SERIALIZER IN LOGIN")
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            refresh['isAdmin'] = user.is_superuser

            return Response(
                {
                    'message':'Login Succesfully',
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)




##Display UserProfile
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):

        print("Call to ProfileView")

        if not request.user.is_profile_updated:
                return Response({
                    "error": "Profile not completed",
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_profile_updated": False
                }, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)
            profile_data = serializer.data
            profile_data["last_updated_at"] = format_time_difference(profile.last_updated_at)

            return Response(profile_data, status=200)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=404)



##Create UserProfile View
class CreateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        # Check if the user already has a profile
        if Profile.objects.filter(user=request.user).exists():
            return Response({"message": "Profile already created!"}, status=status.HTTP_200_OK)

        # If no profile exists, create a new one
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():

            serializer.save(user=request.user)


            request.user.is_profile_updated = True
            request.user.save()

            profile = Profile.objects.get(user=request.user)


            last_updated_str = format_time_difference(profile.last_updated_at)
            return Response({"message": "Profile created successfully!",
                            "last_updated_at": last_updated_str,
                            "is_profile_updated": True}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


##Update UserProfile View
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]


    def patch(self, request):
        try:
            print("Call to UpdateProfileView")
            # Retrieve the user's existing profile
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"message": "Profile not found!"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the profile with the provided data
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            last_updated_str = format_time_difference(profile.last_updated_at)
            return Response({"message": "Profile updated successfully!",
                              "last_updated_at": last_updated_str}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    

class SetProfilePicView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser,FormParser]

    def post(self, request,):
        try:
            print("Request Data:", request.data)
            print("Request Files:", request.FILES)  # Debug file data
            print("Request Headers:", request.headers)

            if not request.FILES:
                return Response(
                    {
                        "error": "No files uploaded",
                        "debug_info": {
                            "content_type": request.content_type,
                            "files_received": bool(request.FILES),
                            "headers": dict(request.headers),
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            


            user = request.user

            user_image, created = UserImage.objects.get_or_create(user=user)

            #Pass the request data to the serializer for validation
            serializer = UserImageSerializer(user_image, data=request.data, partial=True)

            if serializer.is_valid():
                # Save the updated UserImage instance with the new images
                serializer.save()

                print("Uploaded files:", request.FILES)
                print("UserImage instance data:", serializer.validated_data)

                
                return Response(
                    {"message": "Images uploaded successfully!", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        try:
            # Retrieve the UserImage instance for the user
            user_image = UserImage.objects.get(user=request.user)
            serializer = UserImageSerializer(user_image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserImage.DoesNotExist:
            return Response({"error": "No images found for this user."}, status=status.HTTP_404_NOT_FOUND)


class UpdateProfilePicView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            # Retrieve the UserImage instance for the authenticated user
            user_image = UserImage.objects.get(user=request.user)

            # Pass the request data to the serializer for partial update
            serializer = UserImageSerializer(user_image, data=request.data, partial=True)

            if serializer.is_valid():
                # Save the updated fields
                serializer.save()
                user_image.full_clean()
                return Response(
                    {"message": "Profile picture updated successfully!", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except UserImage.DoesNotExist:
            return Response(
                {"error": "No profile images found for this user. Please upload first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

    def delete(self, request, *args, **kwargs):
        try:
            # Retrieve UserImage instance
            user_image = UserImage.objects.get(user=request.user)

            # Get the image field to delete
            image_field = request.data.get("image_field")
            if not image_field or not hasattr(user_image, image_field):
                return Response(
                    {"error": "Invalid image field specified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get the image file and delete it if it exists
            image_file = getattr(user_image, image_field)
            if image_file:
                # Delete the file from storage
                image_file.delete(save=False)
                # Remove reference from the database
                setattr(user_image, image_field, None)
                user_image.save()

                return Response(
                    {"message": f"{image_field} removed successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": f"{image_field} does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        except UserImage.DoesNotExist:
            return Response(
                {"error": "No profile images found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DatingCardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            current_user = request.user
            
            user_profile = current_user.profile
            preferred_gender = user_profile.gender_preferences
            
            if preferred_gender == 'bi':
                gender_filter = Q()  
            else:
                gender_filter = Q(profile__gender=preferred_gender)
            
            users = Users.objects.filter(
                is_active=True,
                is_email_verified=True,
                is_profile_updated=True,
                profile__isnull=False,
                images__isnull=False).filter(gender_filter).exclude(id=current_user.id).select_related('profile','images')
            
            serializer = DatingCardSerializer(users, many=True)
            return Response({'status': 'success','data': serializer.data })
            
        except Exception as e:
            return Response({'status': 'error','message': str(e)}, status=500)
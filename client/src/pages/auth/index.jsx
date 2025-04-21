import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
  } = useContext(AuthContext);

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  // Basic validation - just check if fields are not empty
  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  async function handleLoginWithErrorHandling(event) {
    try {
      const result = await handleLoginUser(event);
      if (!result.success) {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error?.response?.data) {
        toast.error(error.response.data.message || "Invalid credentials");
      } else if (error?.request) {
        toast.error("No response from server");
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Invalid username or password");
      }
    }
  }

  async function handleRegisterWithErrorHandling(event) {
    event.preventDefault();
    try {
      // Perform all validations but show them as toast notifications
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Create an array of validation errors
      const validationErrors = [];

      // Check all fields in one go
      if (!signUpFormData.userName || signUpFormData.userName.trim() === "") {
        validationErrors.push("Username is required");
      } else if (signUpFormData.userName.length < 3) {
        validationErrors.push("Username must be at least 3 characters long");
      }

      if (!signUpFormData.userEmail || signUpFormData.userEmail.trim() === "") {
        validationErrors.push("Email is required");
      } else if (!emailRegex.test(signUpFormData.userEmail)) {
        validationErrors.push("Please enter a valid email address");
      }

      if (!signUpFormData.password) {
        validationErrors.push("Password is required");
      } else if (signUpFormData.password.length < 6) {
        validationErrors.push("Password must be at least 6 characters long");
      }

      // Display all validation errors in sequence
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => {
          toast.error(error);
        });
        return; // Stop the registration process if validation fails
      }

      // All validations passed, proceed with registration
      const result = await handleRegisterUser(event);

      if (!result.success) {
        toast.error(result.message || "Registration failed");
      } else {
        toast.success("Registration successful! Please login.");

        // Wait for the toast to be visible before redirecting
        setTimeout(() => {
          // Set the active tab to signin after successful registration
          setActiveTab("signin");
        }, 2000); // 2 second delay to ensure toast is visible
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error?.response?.data) {
        toast.error(error.response.data.message || "Registration failed");
      } else if (error?.request) {
        toast.error("No response from server");
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to register. Please try again.");
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b">
        <Link to={"/"} className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 mr-4" />
          <span className="font-extrabold text-xl">LMS LEARN</span>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <Link
            to={"/instructor/auth/login"}
            className="flex items-center justify-center"
          >
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Instructor Login
            </button>
          </Link>
          <Link to={"/auth"} className="flex items-center justify-center">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Student Login
            </button>
          </Link>
        </div>
      </header>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={"Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid()}
                  handleSubmit={handleLoginWithErrorHandling}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Create a new account</CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={"Sign Up"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  handleSubmit={handleRegisterWithErrorHandling}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;

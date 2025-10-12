"use client";

import React, { useState,useEffect } from "react";
import {
  Clock,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle,
  Stethoscope,
  Shield,
  Award,
} from "lucide-react";
import PatientForms from "./AppointmentForm";
import { useDashboardData } from "../contexts/dataCollection";
import Link from "next/link";

interface PatientPortalProps {
  onGoToAdmin: () => void;
}

export function FPatientPortal({ onGoToAdmin }: PatientPortalProps) {
  const { services } = useDashboardData();
  useEffect(() => {
  console.log(services)
  }, [])
  
  let servicesLoading = false;
  if (services.length) {
    servicesLoading = false;
  } else {
    servicesLoading = true;
  }

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Kachakali Vision Care
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Your trusted partner for comprehensive eye care services.
              Experience excellence in vision care with our state-of-the-art
              facilities and expert team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowBookingForm(true)}
                className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
              >
                Book Appointment
              </button>
              <button
                onClick={onGoToAdmin}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-teal-600 transition-colors font-semibold"
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {bookingSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">
              Appointment booked successfully! We'll contact you soon to
              confirm.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Expert Care
            </h3>
            <p className="text-gray-600">
              Experienced ophthalmologists and optometrists providing
              comprehensive eye care
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Advanced Technology
            </h3>
            <p className="text-gray-600">
              State-of-the-art equipment for accurate diagnosis and treatment
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quality Service
            </h3>
            <p className="text-gray-600">
              Committed to providing the highest quality eye care services
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive range of eye care services to meet all
              your vision needs
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500">
                Loading...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter((service) => service.isActive)
                .map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <span className="text-teal-600 font-bold">
                        ₹{service.price}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs">
                        {service.category}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600">
              Get in touch with us for appointments or inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+91 9635868211</p>
              <p className="text-gray-600">+91 8250611063</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              {/* <p className="text-gray-600">info@kachakali.com</p> */}
              <p className="text-gray-600">singhasatish9@gmail.com</p>
              <p className="text-gray-600">singhasatish9@gmail.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                VisionCare Durga Puja ground, Bhaispita - Kachakali Rd, West
                Bengal 733207
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Book Your Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="w-full mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-gray-600">
              Visit our clinic at the location below
            </p>
          </div>
          <div className="w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d281.7104539441418!2d88.37211285332732!3d26.44275057239368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e459a06c9fd3ab%3A0xafa2f07ff5723b26!2sKachakali%20vision%20care!5e1!3m2!1sen!2sin!4v1759463652726!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div>
          <PatientForms
            setShowBookingForm={setShowBookingForm}
            setBookingSuccess={setBookingSuccess}
          />
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                About Kachakali Vision Care
              </h3>
              <p className="text-gray-400 text-sm">
                Providing quality eye care services with state-of-the-art
                technology and experienced professionals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    Book Appointment
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  +91 8250611063
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  singhasatish9@gmail.com
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  VisionCare Durga Puja ground, Bhaispita - Kachakali Rd
                </li>
              </ul>
            </div>
          </div>
          Copyright
          <div className="pt-8 flex justify-between border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Kachakali Vision Care.</p>
            <p>
              Developed by{" "}
              <Link href="https://devnitishx.vercel.app/">
                Nitish Chandra Singha
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

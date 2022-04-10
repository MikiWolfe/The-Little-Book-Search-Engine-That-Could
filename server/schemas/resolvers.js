const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {

  Query: {
    // me
    me: async (parent, args, context) => {
      
      if (context.user) {
        const userData = await User.findOne({
          _id: context.user._id,
        }).populate("savedBooks").select("-__v -password");
        

        return userData;
      }

      throw new AuthenticationError("Not logged in.");
    },
  },

  Mutation: {
    // adding a user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    // logging in user
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No email found. Get better args.");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Password");
      }

      const token = signToken(user);
      return { token, user };
    },

    // allowing user to save a book they like ?
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.input } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in.");
    },

    removeBook: async (parent, args, context) => {
      if (!context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user_id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in.");
    },
  },
};

module.exports = resolvers;

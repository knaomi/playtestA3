import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface LikeOptions {
  backgroundColor?: string;
}

export interface LikeDoc extends BaseDoc {
  author: ObjectId;
  post: ObjectId;
}

/**
 * concept: Liking [Post]
 */
export default class LikingConcept {
  public readonly likes: DocCollection<LikeDoc>;

  /**
   * Make an instance of Liking.
   */
  constructor(collectionName: string) {
    this.likes = new DocCollection<LikeDoc>(collectionName);
  }

  async addLike(author: ObjectId, post: ObjectId) {
    const _id = await this.likes.createOne({ author, post });
    return { msg: "Like successfully created!", like: await this.likes.readOne({ _id }) };
  }

  async getLikes() {
    // Returns all likes on all posts! You might want to page for better client performance
    return await this.likes.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.likes.readMany({ author });
  }

  async delete(_id: ObjectId) {
    await this.likes.deleteOne({ _id });
    return { msg: "Like deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const like = await this.likes.readOne({ _id });
    if (!like) {
      throw new NotFoundError(`Like ${_id} does not exist!`);
    }
    if (like.author.toString() !== user.toString()) {
      throw new LikeAuthorNotMatchError(user, _id);
    }
  }
}

export class LikeAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of like {1}!", author, _id);
  }
}

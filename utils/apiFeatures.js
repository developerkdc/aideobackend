class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          title: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });

    if (this.queryStr.language) {
      this.query = this.query.find({ language: this.queryStr.language });
    }

    if (this.queryStr.ageRating) {
      this.query = this.query.find({ ageRating: this.queryStr.ageRating });
    }

    if (this.queryStr.liveStatus) {
      this.query = this.query.find({ liveStatus: this.queryStr.liveStatus });
    }

    if (this.queryStr.tags) {
      const tagIds = JSON.parse(this.queryStr.tags).map((tag) => tag);
      if(tagIds.length>0){
          this.query = this.query.find({ tags: { $in: tagIds } });
      }
    }

    if (this.queryStr.creator) {
      this.query = this.query.find({ creatorId: this.queryStr.creator });
    }

    if (this.queryStr.from) {
        const fromDate = new Date(this.queryStr.from);
        this.query = this.query.find({ createdDate: { $gte: fromDate } });
      }
    
      if (this.queryStr.to) {
        const toDate = new Date(this.queryStr.to);
        toDate.setDate(toDate.getDate() + 1); // Add 1 day to the end date
        this.query = this.query.find({ createdDate: { $lt: toDate } });
      }

    return this;
  }
}

export default ApiFeatures;

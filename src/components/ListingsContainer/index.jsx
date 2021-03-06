import React, { Component } from 'react';
import client from '../../services/client';
import styles from './styles.scss';
import Header from '../common/Header';
import NewListingForm from '../NewListingForm';
import ListingsList from '../ListingsList';

class ListingsContainer extends Component {
  constructor() {
    super();
    this.state = {
      listings: [],
      loading: true,
      showServerError: false,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    return client.getListings().then(listings => {
      return this.setState({ listings, loading: false });
    }).catch(() => {
      return this.setState({ showServerError: true });
    });
  }

  // new listing submission handling
  handleSubmit(title, url) {
    let listings = this.state.listings.slice();

    return client.createListing(title, url).then(listing => {
      listings.push(listing);

      // rerender the coopnent with the new listing added
      return this.setState({ listings });
    });
  }

  onDeletePress(id) {
    // filters through listings and returns all listings except for one that we will delete
    let remainder = this.state.listings.filter((listing) => {
      if(listing.id !== id) return listing;
    });
    // make API call for lisiting deletion
    client.deleteListing(id).then(() => {
      // rerender component with remaining listings after the filter
      return this.setState({ listings: remainder, showDeleteModal: false });
    }).catch(() => {
        this.setState({ showServerError: true });
    });
  }

  // handles submit of the edit form inside the modal
  handleEditSubmit(title, url, id) {
    return client.editListing(title, url, id).then((response) => {

      // filter through the listings to find the one that matches the changed listing
      const { title, url, id } = response;

      // spread the listings into an array to search for the target listing to edit
      let listings = [...this.state.listings];
      let targetListing = listings.find((listing) => {
				return listing.id === id;
      });
      
      // change the found listing 
      targetListing.title = title;
      targetListing.url = url;

      // set state to rerender component after edit
      this.setState({ listings });
      });
  }


  render() {

    const { listings, loading, showServerError, showDeleteModal } = this.state;

    return(
      <div className={styles.container}>
      <Header title="Listings" />
        <main>
          <NewListingForm
            className={styles.newListingForm}
            onSubmit={(title, url) => this.handleSubmit(title, url)}
          />
        </main>
        <ListingsList
          className={styles.listings}
          listings={listings}
          loading={loading}
          showServerError={showServerError}
          onDeletePress={this.onDeletePress.bind(this)}
          handleEditSubmit={this.handleEditSubmit.bind(this)}
          showDeleteModal={showDeleteModal}
        />
      </div>
    );
  }

}

export default ListingsContainer;
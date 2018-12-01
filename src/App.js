import React, { Component } from 'react';
import purelove from './music-library/purelove.mp3';
import takeyourtime from './music-library/takeyourtime.mp3';
import tryzouk from './music-library/try.mp3';
import eraumavez from './music-library/eraumavez.mp3';
import apologize from './music-library/apologize.mp3';
import howtosavealife from './music-library/howtosavealife.mp3';
import yousoundgood from './music-library/yousoundgood.mp3';
import badthings from './music-library/badthings.mp3';

import './App.css';

function tagsFromSongList(songs) {
  var tags = [];
  for (var i = 0; i < songs.length; i++) { 
    for (var j = 0; j < songs[i].tags.length; j++) {
      if (!tags.includes(songs[i].tags[j])) {
        tags.push(songs[i].tags[j]);
      }
    }
  }
  return tags;
}

const song_list = [
  {
    name: "Apologize by One Republic",
    source: apologize,
    tags: ["pop", "zoukable", "moody"],
  },
  {
    name: "How to Save a Life",
    source: howtosavealife,
    tags: ["pop", "moody"],
  },
  {
    name: "You Sound Good to Me by Lucy Hale",
    source: yousoundgood,
    tags: ["country", "happy"],
  },
  {
    name: "Bad Things by MGK & Camila Cabello",
    source: badthings,
    tags: ["pop", "moody"],
  },
  {
    name: "Pure Love by Arash ft. Helena",
    source: purelove,
    tags: ["pop", "zouk", "happy"],
  },
  {
    name: "Take Your Time - Kizomba Remix",
    source: takeyourtime,
    tags: ["pop", "zouk", "country", "chillout"],
  },
  {
    name: "Try - Zouk Remix",
    source: tryzouk,
    tags: ["pop", "zouk"],
  },
  {
    name: "Era Uma Vez - Zouk Remix",
    source: eraumavez,
    tags: ["pop", "zouk", "chillout", "happy"],
  }
];

const initial_state = {
  songs: song_list,
  tags: tagsFromSongList(song_list), //['cello', 'classical', 'orchestral', 'sleepy', 'pop', 'zouk', 'happy', 'country', 'chillout', 'moody', 'zoukable'],
  queue: [],
  upNext: [],
  isPlaying: false,
  selector: {
    active_selectors: [],
    isIntersection: false,
  }
};

class App extends Component {
  render() {
    return (
      <div>
        <View/>
      </div>
      
    );
  }
}


class View extends React.Component {
  constructor(props) {
    super(props);
    this.onAddNewSong = this.onAddNewSong.bind(this);
    this.onTagClicked = this.onTagClicked.bind(this);
    this.onDeleteSong = this.onDeleteSong.bind(this);
    this.onPrintState = this.onPrintState.bind(this);
    this.onTogglePlay = this.onTogglePlay.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onVolUp = this.onVolUp.bind(this);
    this.onVolDown = this.onVolDown.bind(this);
    this.onNextSong = this.onNextSong.bind(this);
    this.onQueueSong = this.onQueueSong.bind(this);
    this.removeSongFromQueue = this.removeSongFromQueue.bind(this);
    this.playSong = this.playSong.bind(this);
    this.nextSongGivenPlayer = this.nextSongGivenPlayer.bind(this);
    this.onSlideUnionIntersection = this.onSlideUnionIntersection.bind(this);
    this.onEnqueueSelected = this.onEnqueueSelected.bind(this);
    this.state = initial_state;
  }

  onAddNewSong(e) {
    e.preventDefault();
    var name = e.target[0].value;
    e.target[0].value = "";
    var source = e.target[1].value;
    e.target[1].value = "";
    var tagString = e.target[2].value;
    e.target[2].value = "";

    console.log(name + ", " + source + ", " + tagString);

    this.setState((prevState, props) => {
      var mergeTags = prevState.tags;
      var tags = tagString.split(',');
      for (var i = 0; i < tags.length; i++) {
        tags[i] = tags[i].trim();
        if (tags[i].length == 0) continue;
        if (!mergeTags.includes(tags[i])) {
          mergeTags.push(tags[i]);
        }
      }
      return {songs: [...prevState.songs,
                      {
                        name: name,
                        source: source,
                        tags: tags
                      }],
              tags: mergeTags};
    });
  }

  onTagClicked(e) {
    var tag = e.target.innerText;
    console.log(tag);
    this.setState((prevState, props) => {
      var newTags = [];
      var isFound = false;
      for (var i = 0; i < prevState.selector.active_selectors.length; i++) {
        if (prevState.selector.active_selectors[i].value == tag) {
          isFound = true;
        } else {
          newTags.push(prevState.selector.active_selectors[i]);
        }
      }

      if (!isFound) {
        var newSelector = {'selector': 'tags', 'value': tag};
        newTags.push(newSelector);
      }

      return {
        selector: {
          active_selectors: newTags,
          isIntersection: prevState.selector.isIntersection,
        }
      }
    });
  }

  onQueueSong(e) { //queue from button
    var songContainer;
    if (e.target.childElementCount == 0) { // could click the icon or background
      songContainer = e.target.parentNode.parentNode;
    }  else {
      songContainer = e.target.parentNode;
    }
    var songName = songContainer.children[0].innerText;
    console.log("enqueueing: " + songName);
    this.setState((prevState, props) => {
      var song = {name: "", source: ""};
      for (var i = 0; i < prevState.songs.length; i++) {
        if (prevState.songs[i].name == songName) {
          song = {
            name: prevState.songs[i].name,
            source: prevState.songs[i].source
          };
          break;
        }
      }

      // could check if nothing playing, make this queued song current song
      if (!prevState.isPlaying && prevState.queue.length == 0) {
        var player = songContainer.parentElement.parentElement.children[1].children[2];
        this.playSong(player, song.source);
        return {
          currentSongName: song.name,
          currentSongSource: song.source,
          isPlaying: true
        }
      }
      return {
        queue: [...prevState.queue, song]
      }
    });
  }

  removeSongFromQueue(e) {
    var deleteButton = e.target.parentElement;
    var queueArray = e.target.parentElement.parentElement.children;
    var index = Array.from(queueArray).indexOf(deleteButton) / 3;
    this.setState((prevState, props) => {
      return {
        queue: prevState.queue.splice(0, index).concat(prevState.queue.splice(1))
      }
    });
  }

  onDeleteSong(e) {
    var songName = e.target.parentNode.parentNode.children[0].innerText;
    console.log("deleting: " + songName);
    this.setState((prevState, props) => {
      var newSongs = [];
      for (var i = 0; i < prevState.songs.length; i++) {
        if (prevState.songs[i].name != songName) {
          newSongs.push(prevState.songs[i]);
        }
      }
      return {
        songs: newSongs
      }
    });
  }
  
  onPrintState() {
    console.log("printing state");
    console.log(this.state);
  }
  
  onPlay(e) {
    var node = document.getElementById("player");
    console.log("node: " + node);
    console.log(node);
    var player = e.target.parentNode.parentNode.children[2];
    player.play().catch(function(e) {
      console.log(e);
    })
  }
  
  onPause(e) {
    var player = e.target.parentNode.parentNode.children[2];
    player.pause();
  }
  
  onTogglePlay(e) {
    console.log(e);
    var player = document.getElementById("player");// e.target.parentNode.parentNode.children[2];
    console.log("player");
    console.log(player);
    this.setState((prevState, props) => {
      var newIsPlaying;
      if (prevState.isPlaying) {
        player.pause();
        newIsPlaying = false;
      } else {
        player.play();
        newIsPlaying = true;
        if (player.children[0].src == "") {
          newIsPlaying = false;
        }
      }
      return {isPlaying: newIsPlaying}
    });
  }
  
  onVolUp(e) {
    console.log(e);
    console.log(e.target.parentNode.parentNode);
    var player = document.getElementById("player"); // e.target.parentNode.parentNode.children[2];
    if (player.volume >= 1) return;
    player.volume += .2;
  }
  
  onVolDown(e) {
    console.log(e);
    console.log(e.target.parentNode.parentNode);
    var player = document.getElementById("player"); //e.target.parentNode.parentNode.children[2];
    if (player.volume <= 0) return;
    player.volume -= .2;
  }

  playSong(player, songSource) {
    player.children[0].src = songSource;
    player.load();

    const playPromise = Promise.resolve(player.play());
  
    // Pause when the Promise is resolved. This MIGHT be
    //  immediate (synchronous)!
    playPromise
    .then(() => {
      console.log("Pausing from unified Promise flow.");
    })
    // Safety first!
    .catch(e => {
      console.log(e.message);
    });

  }
  
  nextSongGivenPlayer(player) {
    var newSongName="", newSongSource="";
    this.setState((prevState, props) => {
      var newIsPlaying = true;
      if (prevState.queue.length > 0) {
        newSongName = prevState.queue[0].name;
        newSongSource = prevState.queue[0].source;
      } else { // else nothing comes next, we're not playing
        newIsPlaying = false;
      }

      var newQueue = prevState.queue.slice(1);
      this.playSong(player, newSongSource)
      
      return {
        queue: newQueue,
        currentSongName: newSongName,
        currentSongSource: newSongSource,
        isPlaying: newIsPlaying
      }
    });
  }
  
  onNextSong(e) {
    var player = document.getElementById("player"); // e.target.parentNode.parentNode.children[2];
    this.nextSongGivenPlayer(player);
  }

  onSlideUnionIntersection(e) {
    this.setState((prevState, props) => {
      return {
        selector: {
          active_selectors: prevState.selector.active_selectors,
          isIntersection: !prevState.selector.isIntersection,
        }
      }
    });
  }

  onEnqueueSelected(e) {
    this.setState((prevState, props) => {
      var queue = prevState.queue;
      for (var i = 0; i < prevState.songs.length; i++) {
        if(isSelected(prevState.songs[i], prevState.selector)) {
          queue.push({
            name: prevState.songs[i].name,
            source: prevState.songs[i].source
          });
        }
      }

      return {
        queue: queue,
      }
    })
  }

  render () {
    var songs = [], tags = [], selector = {active_selectors: [], isIntersection: false}, queue=[], upNext = [];
    var currentSongSource = "", currentSongName = "";
    var numSongs = 0;
    var isPlaying = false;
    if (this.state !== null) {
      if (this.state.songs !== undefined) {
        songs = this.state.songs;
        numSongs = songs.length;
      } 
      if (this.state.tags !== undefined) {
        tags = this.state.tags;
      }
      if (this.state.selector !== undefined) {
        selector = this.state.selector;
      }
      if (this.state.queue !== undefined) {
        queue = this.state.queue;
        console.log("queue: " + queue);
      }
      if (this.state.upNext !== undefined) {
        upNext = this.state.upNext;
      }
      
      currentSongName = this.state.currentSongName;
      currentSongSource = this.state.currentSongSource;
      isPlaying = this.state.isPlaying;
    }
    /* <PrintState onPrintState={this.onPrintState}/>*/
    return (
      <div>
        <h3>mia's music</h3>
        <Player queue={queue} upNext={upNext}
          togglePlay={this.onTogglePlay}
          isPlaying={isPlaying}
          currentSongName={currentSongName}
          currentSongSource={currentSongSource}
          volUp={this.onVolUp} volDown={this.onVolDown}
          next={this.onNextSong}
          nextSongGivenPlayer={this.nextSongGivenPlayer}
          deleteSong={this.removeSongFromQueue}/>
        <Search onTagClicked={this.onTagClicked} 
          tags={tags} selector={selector}
          onEnqueueSelected={this.onEnqueueSelected}
          changeUnionIntersection={this.onSlideUnionIntersection}
          numSongs={numSongs}
        />
        <SongList songs={songs} selector={selector} 
          onDeleteSong={this.onDeleteSong} onQueueSong={this.onQueueSong}/>
        <AddSong onAddNewSong={this.onAddNewSong}/>
        <Footer/>
      </div>
    );
  }
}

class Footer extends React.Component {
  render() {
    return (
      <div className="controls">
      <p>written by mia</p>
      <i className="fas fa-cog"></i>
      </div>
    )
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.handleSongEnded = this.handleSongEnded.bind(this);
  }
  
  handleSongEnded(f) {
    return () => {
      var player = document.getElementById("player");
      console.log('song ended');
      f(player);
    }
  }
  
  render() {
    var queue=[];
    for (var i = 0; i < this.props.queue.length; i++) {
      queue.push(<span key={"del"+i} onClick={this.props.deleteSong}><i className="delete fas fa-times"></i> </span>);
      queue.push(<span key={"q"+i}>{this.props.queue[i].name}</span>);
      queue.push(<br key={"br"+i}/>);
    }
    
    console.log(this.props.queue);
    console.log(this.props.currentSongSource);
    console.log(this.props.currentSongName);
    
    var player = <audio id="player" 
                   onEnded={this.handleSongEnded( 
                                            this.props.nextSongGivenPlayer)}
                    key="audio">
          <source src={this.props.currentSongSource} 
            type="audio/mpeg"/>
        </audio>;
    
    var togglePlayText = this.props.isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>;
    
    return (
      <div className={"widget special-widget"}>
        <p key="info"><b>{this.props.currentSongName}</b></p>
        <div key="controls" className="controls">
          <button key="playButton" onClick={this.props.togglePlay}>{togglePlayText}</button>
          <button key="skipButton" onClick={this.props.next}><i className="fas fa-step-forward"></i></button>
          <button key="volUp" onClick={this.props.volUp}>
            <i className="fas fa-plus"></i>
          </button>
          <button key="volDown" onClick={this.props.volDown}>
            <i className="fas fa-minus"></i>
          </button>
        </div>
        {player}
        <p>
        {queue}</p>
      </div>
    )
  }
}

class Search extends React.Component {
  render() {
    var tagItems = [];
    var activeTags = [];
    var selectors = this.props.selector.active_selectors;
    for (var i = 0; i < selectors.length; i++) {
      activeTags.push(selectors[i].value);
    }
    console.log("active tags: " + activeTags);
    if (this.props.tags.length > 0) {
      var isActive = activeTags.includes(this.props.tags[0]) ? " active-tag" : "";

      tagItems.push(<span key={"searchtag0"} className={"tag" + isActive} onClick={this.props.onTagClicked}>
          {this.props.tags[0]}</span>);
    }

    for (var i = 1; i < this.props.tags.length; i++) {
      var isActive = activeTags.includes(this.props.tags[i]) ? " active-tag" : "";

      tagItems.push(<span key={"pipe" + i}> | </span>);
      tagItems.push(<span key={"searchtag" + i} className={"tag" + isActive} onClick={this.props.onTagClicked}>
          {this.props.tags[i]}</span>);
    }

    return (
      <div className='widget special-widget'>
        <div>{tagItems}</div>
        <p>
          union
          <label className="switch">
            <input onChange={this.props.changeUnionIntersection} type="checkbox"/>
            <span className="slider round"></span>
          </label>
          intersection
        </p>
        <p><button onClick={this.props.onEnqueueSelected}>enqueue {this.props.numSongs} selected</button></p>
        <p>
          <i className="fas fa-search"></i> <input className='no-underline' type="text" name="search"/>
        </p>
      </div>
    );
  }
}

class PrintState extends React.Component {  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='widget special-widget'>
        <form onSubmit={this.props.onPrintState}>
          <input type="submit" value="print state"/>
        </form>
      </div>
    );
  }
}

class AddSong extends React.Component {  
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='widget special-widget'>
        <form onSubmit={this.props.onAddNewSong}>
          <p>name: <input type="text" name="songName"/>
          </p>
          <p>source: <input type="text" name="source"/>
          </p>
          <p>tags (comma-separated): <input type="text" name="tags"/>
          </p>
          <input type="submit" value="add song"/>
        </form>
      </div>
    );
  }
}

function isSelected(song, selector) {
  var active_selectors = selector.active_selectors;
  if (selector.isIntersection) {
    for (var j = 0; j < active_selectors.length; j++) {
      var oneSelector = active_selectors[j];
      if (!song['tags'].includes(oneSelector.value)) {
        return false;
      }
    }
    return true;
  } else {
    for (var j = 0; j < active_selectors.length; j++) {
      var oneSelector = active_selectors[j];
      if (song['tags'].includes(oneSelector.value)) {
        return true;
      }
    }
    return active_selectors.length == 0; // true if empty, false otherwise
  }

  // if it's union, then.. false bc we hadn't seen a tag yet
  // if it's intersection, then true bc we didn't return false
  return selector.isIntersection;
}

class SongList extends React.Component {
  render() {
    var s = this.props.songs;
    var names = []
    for (var i = 0; i < s.length; i++) {
      var selected = isSelected(s[i], this.props.selector);
      if (selected) {
        names.push(
          <Song key={"song" + i} 
              onDelete={this.props.onDeleteSong} 
              onQueue={this.props.onQueueSong}
              index={i}
              {...s[i]} 
          />
        );
      }
    }
    return (
      <div>
        {names}
      </div>
    );
  }
}

class Song extends React.Component {
  render() {
    var tags = [];
    if (this.props.tags.length > 0) {
      tags.push(<span key="tag0">{this.props.tags[0]}</span>);
    }
    for (var i = 1; i < this.props.tags.length; i++) {
      tags.push(<span key={"comma" + i}>, </span>);
      tags.push(<span key={"tag" + i}>{this.props.tags[i]}</span>);
    }

    /*
              <button onClick={this.props.onDelete}><i class="far fa-trash-alt"></i></button>
          <span> </span>*/
    return (
      <div className="song-container widget">
        <h4 key="name">{this.props.name}</h4>
        <p key="tags" class="pad-right-for-button">{tags}</p>
        <button key="enqueue" className={"float-top-right"} onClick={this.props.onQueue}><i className="fas fa-plus"></i></button>
      </div>
    )
  }
}


export default App;
